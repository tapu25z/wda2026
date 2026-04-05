# app/rag.py
import os, json
from pathlib import Path
from typing import List, Tuple

# keep same imports used trong run-model.py to minimize change
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
KB_PATH = DATA_DIR / "plant_knowledge.json"

def load_knowledge(kb_path: Path = KB_PATH):
    if not kb_path.exists():
        raise FileNotFoundError(f"Knowledge JSON not found at {kb_path}")
    with open(kb_path, "r", encoding="utf-8") as f:
        kb = json.load(f)
    return kb

# create embeddings & vector DB (cached)
_vectorstore = None
# ai/rag.py (Sửa lại hàm init_vector_db)

def init_vector_db(emb_model_name: str = None, force: bool = False):
    global _vectorstore
    if _vectorstore is not None and not force:
        return _vectorstore

    emb_model = emb_model_name or os.environ.get("HF_EMBEDDINGS_MODEL", "keepitreal/vietnamese-sbert")
    embeddings = HuggingFaceEmbeddings(model_name=emb_model)

    kb = load_knowledge()
    docs = []

    # KIỂM TRA VÀ XỬ LÝ THEO KIỂU DỮ LIỆU CỦA JSON
    if isinstance(kb, list):
        # Nếu JSON là dạng List: [ {...}, {...} ]
        for data in kb:
            if data.get("Status") != "Normal":
                content = (
                    f"Bệnh: {data.get('LOAI_BENH')}. "
                    f"Triệu chứng: {data.get('DAC_DIEM')}. "
                    f"Cách trị: {data.get('GIAI_PHAP')}. "
                    f"Thuốc: {data.get('LIEU_TRINH_VA_THUOC', {}).get('Hoat_chat_dac_tri', '')}"
                )
                # Dùng LOAI_BENH làm class_name để lọc sau này
                meta = {"class_name": data.get("LOAI_BENH"), "ten_cay": data.get("TEN_CAY")}
                docs.append(Document(page_content=content, metadata=meta))
    
    elif isinstance(kb, dict):
        # Nếu JSON là dạng Dictionary: { "key": {...} } (Code cũ của bạn)
        for key, data in kb.items():
            if data.get("Status") != "Normal":
                content = (
                    f"Bệnh: {data.get('LOAI_BENH')}. "
                    f"Triệu chứng: {data.get('DAC_DIEM')}. "
                    f"Cách trị: {data.get('GIAI_PHAP')}. "
                    f"Thuốc: {data.get('LIEU_TRINH_VA_THUOC', {}).get('Hoat_chat_dac_tri', '')}"
                )
                meta = {"class_name": key, "ten_cay": data.get("TEN_CAY")}
                docs.append(Document(page_content=content, metadata=meta))

    if not docs:
        print("[rag.py] Warning: no docs created from KB.")
        return None

    vs = Chroma.from_documents(docs, embeddings)
    _vectorstore = vs
    return vs

def query_vectorstore(vectorstore, query: str, k: int = 3, filter_label: str = None):
    """
    Tìm kiếm k tài liệu liên quan, có hỗ trợ lọc theo nhãn bệnh để tránh nhầm lẫn.
    """
    # Chuẩn bị tham số filter cho LangChain (Chroma/FAISS)
    # Giả sử trong lúc index dữ liệu, bạn đã lưu metadata có key là 'class_name'
    search_kwargs = {"k": k}
    if filter_label:
        search_kwargs["filter"] = {"class_name": filter_label}

    try:
        # Sử dụng similarity_search_with_score để lấy cả điểm tin cậy
        # Truyền filter vào để giới hạn không gian tìm kiếm
        results = vectorstore.similarity_search_with_score(query, **search_kwargs)
    except Exception as e:
        print(f"[RAG] Search with filter failed: {e}. Falling back to basic search.")
        results = vectorstore.similarity_search(query, k=k)

    out = []
    for item in results:
        # Xử lý kết quả trả về (có thể là tuple (Doc, score) hoặc chỉ Doc)
        if isinstance(item, tuple) and len(item) == 2:
            doc, score = item
        else:
            doc, score = item, None
        
        # Chỉ lấy những tài liệu có điểm số tốt (nếu cần - ví dụ score < 0.6)
        out.append({
            "content": doc.page_content, 
            "metadata": dict(doc.metadata), 
            "score": float(score) if score is not None else None
        })
        
    return out