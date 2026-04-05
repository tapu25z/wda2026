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

# Model mới cho endpoint chat
class ChatRequest(BaseModel):
    label: str    # Nhãn trả về từ predict_endpoint
    prompt: str   # Câu hỏi của người dùng

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

        if confidence < 0.5:
            return {
                "success": False,
                "yolo_label": yolo_label,
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

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Nhận nhãn (label) và câu hỏi (prompt) để trả lời dựa trên RAG.
    """
    global VECTOR_DB
    try:
        # 1. Kiểm tra Vector DB
        vs = VECTOR_DB if VECTOR_DB is not None else init_vector_db()
        
        # 2. Lấy thông tin từ request
        label = req.label
        question = req.prompt

        # 3. Truy vấn Vector Store (kết hợp nhãn và câu hỏi để tìm kiếm chính xác)
        search_query = f"Bệnh {label}: {question}"
        contexts = query_vectorstore(vs, search_query, k=4)

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
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})