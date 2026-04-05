import os
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
from typing import Dict, Any, Optional, List
from PIL import Image, ImageOps
from torchvision import transforms
import timm
import numpy as np

# --- 1. ĐỊNH NGHĨA KIẾN TRÚC MODEL (Giữ nguyên từ file bạn gửi) ---

class ViT_Backbone(nn.Module):
    def __init__(self, model_name='vit_base_patch16_224', pretrained=True):
        super().__init__()
        self.vit = timm.create_model(model_name, pretrained=pretrained)
        if hasattr(self.vit, 'head'): self.vit.head = nn.Identity()
        elif hasattr(self.vit, 'fc'): self.vit.fc = nn.Identity()

    def forward(self, x):
        out = self.vit(x)
        if out.dim() == 3: out = out[:, 0, :]
        return out

class Expert(nn.Module):
    def __init__(self, dim, hidden=512, num_classes=10, p_dropout=0.2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim, hidden),
            nn.GELU(),
            nn.Dropout(p_dropout),
            nn.Linear(hidden, num_classes)
        )
    def forward(self, x): return self.net(x)

class GatingNetwork(nn.Module):
    def __init__(self, dim, num_experts):
        super().__init__()
        self.gate = nn.Linear(dim, num_experts)
    def forward(self, x):
        logits = self.gate(x)
        return torch.softmax(logits, dim=-1)

class ViT_MoE(nn.Module):
    def __init__(self, num_classes, num_experts=3, backbone_name='vit_base_patch16_224', pretrained=False, image_size=224):
        super().__init__()
        self.backbone = ViT_Backbone(model_name=backbone_name, pretrained=pretrained)
        self.backbone.eval()
        dummy = torch.zeros(1, 3, image_size, image_size)
        with torch.no_grad():
            out = self.backbone(dummy)
        self.feature_dim = out.shape[1]
        self.experts = nn.ModuleList([Expert(self.feature_dim, hidden=min(512, max(128, self.feature_dim//2)), num_classes=num_classes) for _ in range(num_experts)])
        self.gating = GatingNetwork(self.feature_dim, num_experts)

    def forward(self, x):
        feats = self.backbone(x)
        if feats.dim() == 3: feats = feats[:, 0, :]
        gate_probs = self.gating(feats)
        expert_logits = torch.stack([expert(feats) for expert in self.experts], dim=1)
        gate_probs_unsq = gate_probs.unsqueeze(-1)
        out = (expert_logits * gate_probs_unsq).sum(dim=1)
        return out, gate_probs

# --- 2. LOGIC LOAD MODEL VÀ NHÃN ---

MODELS_DIR = Path(__file__).resolve().parents[1] / "models"
DEFAULT_MODEL_PATH = MODELS_DIR / "vit_moe_best.pth"
LABEL_JSON_PATH = MODELS_DIR / "class_to_idx.json"

yolo_model = None 
idx_to_class = {}

def load_labels():
    global idx_to_class
    if idx_to_class: return idx_to_class
    try:
        if LABEL_JSON_PATH.exists():
            with open(LABEL_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            # Tự động đảo ngược mapping: {"Rice_Blast": 0} -> {0: "Rice_Blast"}
            sample_val = list(data.values())[0]
            if isinstance(sample_val, int):
                idx_to_class = {int(v): str(k) for k, v in data.items()}
            else:
                idx_to_class = {int(k): str(v) for k, v in data.items()}
            print(f"[INFO] Loaded labels: {idx_to_class}")
        else:
            print(f"[ERROR] class_to_idx.json not found at {LABEL_JSON_PATH}")
    except Exception as e:
        print(f"[ERROR] Load labels failed: {e}")
    return idx_to_class

def load_yolo(model_path: Optional[str] = None):
    global yolo_model
    if yolo_model is not None: return yolo_model

    mp = Path(model_path or os.environ.get("YOLO_MODEL_PATH") or str(DEFAULT_MODEL_PATH))
    names_map = load_labels()
    # Mặc định num_experts=3 theo code bạn gửi
    num_classes = len(names_map) if names_map else 10

    print(f"[INFO] Initializing ViT_MoE with {num_classes} classes...")
    try:
        # Khởi tạo đúng kiến trúc MoE của bạn
        model = ViT_MoE(num_classes=num_classes, num_experts=3)
        
        state_dict = torch.load(mp, map_location="cpu")
        if isinstance(state_dict, dict):
            state_dict = state_dict.get("model", state_dict.get("state_dict", state_dict))
            
        # Fix tiền tố 'module.'
        state_dict = {k.replace("module.", ""): v for k, v in state_dict.items()}
        
        # Load weights vào kiến trúc MoE
        msg = model.load_state_dict(state_dict, strict=True)
        print(f"[INFO] Model loaded successfully: {msg}")
        
    except Exception as e:
        print(f"[RETRY] Strict load failed, trying non-strict: {e}")
        model.load_state_dict(state_dict, strict=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device).eval()
    model.device = device
    yolo_model = model
    return yolo_model

def predict_pil_image(
    pil_image: Image.Image,
    conf_threshold: float = 0.0,
    top_k: int = 1
) -> Dict[str, Any]:
    model = load_yolo()
    img_input = ImageOps.exif_transpose(pil_image).convert("RGB")

    # Sử dụng đúng bộ Normalize bạn đã xác nhận
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                             std=[0.229, 0.224, 0.225])
    ])

    x = transform(img_input).unsqueeze(0).to(model.device)

    with torch.no_grad():
        logits, gate_probs = model(x) # Model của bạn trả về tuple (out, gate_probs)
        probs = F.softmax(logits, dim=1).cpu().numpy()[0]

    idxs = np.argsort(probs)[-top_k:][::-1]
    preds = []
    
    for i in idxs:
        conf = float(probs[i])
        label = idx_to_class.get(int(i), f"Class_{i}")
        if conf >= conf_threshold:
            preds.append({"label": label, "confidence": conf})

    top_result = preds[0] if preds else {"label": "unknown", "confidence": 0.0}
    
    # Trả về thêm thông tin gating nếu cần để debug
    return {"predictions": preds, "top": top_result}
