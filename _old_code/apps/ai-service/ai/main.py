import io, os, traceback
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List

from PIL import Image

from ai.model import predict_pil_image, load_yolo
from ai.rag import init_vector_db, query_vectorstore, load_knowledge
from ai.llm import get_llm

app = FastAPI(title="Agri-Scan AI Service")

# --- KHAI BÁO BIẾN TOÀN CỤC ---
# Khai báo ở đây để tránh lỗi "NameError"
VECTOR_DB = None

@app.on_event("startup")
def startup_event():
    global VECTOR_DB
    # Load YOLO
    try:
        load_yolo()
        print("[startup] YOLO loaded successfully.")
    except Exception as e:
        print("[startup] YOLO load error:", e)

    # Khởi tạo Vector DB và gán vào biến global
    try:
        VECTOR_DB = init_vector_db()
        print("[startup] Vector DB initialized successfully.")
    except Exception as e:
        print("[startup] Vector DB init error:", e)
        VECTOR_DB = None

@app.get("/")
def home():
    return {"status": "ok", "service": "agri-scan-ai"}

# --- MODELS ---

class PredictResp(BaseModel):
    success: bool
    yolo_label: Optional[str] = None
    confidence: Optional[float] = None
    rag_context: Optional[list] = None
    answer: Optional[str] = None
    error: Optional[str] = None



# --- ENDPOINTS ---

@app.post("/predict", response_model=PredictResp)
async def predict_endpoint(file: UploadFile = File(...)):
    """
    Chỉ nhận diện ảnh và trả về label + confidence.
    """
    try:
        contents = await file.read()
        pil = Image.open(io.BytesIO(contents))
        
        # Xử lý xoay ảnh nếu có EXIF
        try:
            from PIL import ImageOps
            pil = ImageOps.exif_transpose(pil)
        except: pass
        
        pil = pil.convert("RGB")

        # Dự đoán
        pred = predict_pil_image(pil, conf_threshold=0.0, top_k=3)
        top = pred.get("top", {})
        yolo_label = top.get("label")
        confidence = float(top.get("confidence", 0.0))

        if confidence < 0.7:
            return {
                "success": False,
                "_label": yolo_label,
                "confidence": confidence,
                "error": f"Độ tin cậy thấp ({confidence:.2f}). Vui lòng chụp rõ hơn."
            }

        return {
            "success": True,
            "yolo_label": yolo_label,
            "confidence": confidence
        }
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "error": str(e)}
# Model mới cho endpoint chat
class ChatRequest(BaseModel):
    label: str    # Nhãn trả về từ predict_endpoint
    prompt: str   # Câu hỏi của người dùng

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Pure chat endpoint: uses vectorstore to fetch context then LLM to answer.
    """
    global VECTOR_DB
    try:
        # 1. Kiểm tra Vector DB
        vs = VECTOR_DB if VECTOR_DB is not None else init_vector_db()
        
        # 2. Lấy thông tin từ request (SỬA LẠI CHUẨN)
        label = req.label
        question = req.prompt

        # 3. Truy vấn Vector Store (kết hợp nhãn và câu hỏi để tìm kiếm chính xác)
        search_query = f"Bệnh {label}: {question}"
        contexts = query_vectorstore(vs, search_query, k=4, filter_label=req.label)

        # 4. Xây dựng Prompt cho LLM
        prompt_llm = (
            f"Bạn là chuyên gia nông nghiệp chuyên về bệnh cây trồng.\n"
            f"Kết quả nhận diện: **{label}**\n\n"
            f"Dưới đây là các tài liệu kỹ thuật liên quan:\n"
        )
        for c in contexts:
            prompt_llm += f"\n---\n{c['content']}\n"
            
        prompt_llm += (
            f"\nCâu hỏi của người dùng: {question}\n"
            f"\nHãy trả lời chi tiết bằng tiếng Việt, định dạng Markdown rõ ràng."
        )

        # 5. Gọi LLM
        llm = get_llm()
        try:
            # Ưu tiên dùng .invoke (chuẩn mới) hoặc fallback về gọi trực tiếp
            if hasattr(llm, "invoke"):
                res = llm.invoke(prompt_llm)
                answer_text = getattr(res, "content", str(res))
            elif hasattr(llm, "generate"):
                out = llm.generate([prompt_llm])
                answer_text = out.generations[0][0].text
            else:
                answer_text = llm(prompt_llm)
        except Exception as e:
            print("[/chat] LLM error:", e)
            answer_text = f"Xin lỗi, AI đang gặp vấn đề khi xử lý câu hỏi: {e}"

        return {
            "label": label,
            "answer": answer_text,
            "contexts": contexts
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Trả về lỗi 500 nhưng kèm thông báo rõ ràng để Backend dễ đọc
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})
    
from typing import List, Optional, Union
from pydantic import BaseModel

class DailyTask(BaseModel):
    day: int
    weatherContext: str
    waterAction: str
    fertilizerAction: str
    careAction: str

# Model cho cây BỆNH (Chỉ có lộ trình 7 ngày)
class DiseasedPlantResp(BaseModel):
    estimated_days: int
    roadmap_summary: str
    growth_stages: List[str]
    current_stage_index: int
    daily_tasks: List[DailyTask]

# Model cho cây KHỎE (Thông tin thực vật + 14 ngày)
class HealthyPlantResp(BaseModel):
    commonName: str
    scientificName: str
    family: str
    description: str
    uses: str
    care: str
    category: List[str]
    plantGroup: str
    growthRate: str
    light: str
    water: str
    height: str
    floweringTime: str
    suitableLocation: str
    soil: str
    status: str
    images: List[str]
    estimated_days: int
    roadmap_summary: str
    growth_stages: List[str]
    current_stage_index: int
    daily_tasks: List[DailyTask]
import json
import re

@app.post("/plant_garden", response_model=Union[HealthyPlantResp, DiseasedPlantResp])
async def plant_garden_endpoint(req: ChatRequest):
    global VECTOR_DB
    context_text = "" # Khởi tạo tránh lỗi UnboundLocalError
    
    try:
        vs = VECTOR_DB if VECTOR_DB is not None else init_vector_db()
        is_healthy = "healthy" in req.label.lower() or "khỏe mạnh" in req.label.lower()
        
        # 1. Lấy Context từ RAG
        search_query = f"Đặc tính cây {req.label}" if is_healthy else f"Điều trị bệnh {req.label}"
        contexts = query_vectorstore(vs, search_query, k=3)
        if contexts:
            context_text = "\n".join([c['content'] for c in contexts])

        # 2. Xây dựng Prompt "SẠCH" (Không có comment // để tránh lỗi JSON)
        if is_healthy:
            prompt_llm = f"""
Bạn là chuyên gia thực vật. Cây này KHỎE MẠNH ({req.label}).
Nhiệm vụ: Cung cấp thông tin thực vật và lộ trình chăm sóc 7 ngày.
Dữ liệu tham khảo: {context_text}

BẮT BUỘC TRẢ VỀ JSON RAW, KHÔNG CÓ KÝ TỰ LẠ, KHÔNG CÓ DẤU BA CHẤM.
Cấu trúc:
{{
  "commonName": "...", "scientificName": "...", "family": "...", "description": "...",
  "uses": "...", "care": "...", "category": [], "plantGroup": "...", "growthRate": "...",
  "light": "...", "water": "...", "height": "...", "floweringTime": "...",
  "suitableLocation": "...", "soil": "...", "status": "APPROVED", "images": [],
  "estimated_days": 7,
  "roadmap_summary": "...",
  "growth_stages": ["Cây non", "Phát triển", "Trưởng thành"],
  "current_stage_index": 1,
  "daily_tasks": [
    {{"day": 1, "weatherContext": "...", "waterAction": "...", "fertilizerAction": "...", "careAction": "..."}}
  ]
}}
(Hãy tạo đủ 7 ngày trong daily_tasks)
"""
        else:
            prompt_llm = f"""
Bạn là chuyên gia bệnh lý thực vật. Cây bị BỆNH ({req.label}).
Nhiệm vụ: Lập lộ trình điều trị 7 ngày.
Dữ liệu điều trị: {context_text}

BẮT BUỘC TRẢ VỀ JSON RAW. KHÔNG TRẢ VỀ thông tin thực vật (như scientificName, family...).
Cấu trúc:
{{
  "estimated_days": 7,
  "roadmap_summary": "...",
  "growth_stages": ["Cây non", "Phát triển", "Ra hoa", "Đậu quả", "Nuôi quả", "Thu hoạch"],
  "current_stage_index": 1,
  "daily_tasks": [
    {{"day": 1, "weatherContext": "...", "waterAction": "...", "fertilizerAction": "...", "careAction": "..."}}
  ]
}}
(Hãy tạo đủ 7 ngày trong daily_tasks)
"""

        # 3. Gọi LLM
        llm = get_llm()
        res = llm.invoke(prompt_llm) if hasattr(llm, "invoke") else llm(prompt_llm)
        raw_answer = getattr(res, "content", str(res))

        # 4. Xử lý bóc tách JSON an toàn
        # Xóa các khối markdown ```json ... ``` nếu có
        clean_answer = re.sub(r"```json|```", "", raw_answer).strip()
        json_match = re.search(r"\{.*\}", clean_answer, re.DOTALL)
        
        if json_match:
            # Sửa các lỗi phổ biến của LLM như dấu phẩy thừa trước dấu đóng ngoặc
            json_str = json_match.group()
            json_str = re.sub(r",\s*([\]}])", r"\1", json_str) 
            
            final_json = json.loads(json_str)
            return final_json
        else:
            raise ValueError("Mô hình không sinh ra cấu trúc JSON.")

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": f"Lỗi: {str(e)}"})
