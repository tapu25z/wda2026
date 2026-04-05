import os
import traceback
from types import SimpleNamespace
from google import genai # Thư viện SDK mới nhất của năm 2026
from dotenv import load_dotenv

# Nạp biến môi trường từ file .env nếu có
load_dotenv()

class GeminiLLM:
    """
    Wrapper hiện đại cho Gemini API (chuẩn google-genai).
    Hỗ trợ Agri-Scan AI xử lý chẩn đoán và lập kế hoạch chăm sóc cây.
    """
    def __init__(self, api_key: str, model_name: str = "gemini-3-flash-preview"):
        self.api_key = api_key
        self.model_name = model_name
        # Khởi tạo client theo chuẩn mới
        self.client = genai.Client(api_key=self.api_key)

    def invoke(self, prompt: str, system_prompt: str = None, **kwargs):
        """
        Gửi yêu cầu đến Gemini và trả về kết quả dạng văn bản.
        """
        try:
            # Thiết lập cấu hình cho model (bao gồm system instruction)
            config = {
                "system_instruction": system_prompt,
                "temperature": kwargs.get("temperature", 0.7),
                "max_output_tokens": kwargs.get("max_tokens", 2048),
            }
            
            # Gọi API
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            
            # Trả về đối tượng SimpleNamespace để giữ tính tương thích với code cũ của bạn
            return SimpleNamespace(
                content=response.text, 
                raw=str(response)
            )
            
        except Exception as e:
            error_msg = f"Lỗi Gemini API: {str(e)}"
            print(f"[GeminiLLM] {error_msg}")
            return SimpleNamespace(
                content=f"Xin lỗi, AI gặp sự cố: {error_msg}", 
                raw={"error": str(e)}
            )

    def generate(self, prompts: list, system_prompt: str = None, **kwargs):
        """Hỗ trợ xử lý danh sách nhiều prompt cùng lúc."""
        results = []
        for p in prompts:
            res = self.invoke(p, system_prompt=system_prompt, **kwargs)
            results.append([SimpleNamespace(text=res.content)])
        return SimpleNamespace(generations=results, raw=results)

    def __call__(self, prompt: str, **kwargs):
        """Cho phép gọi object trực tiếp: ai("Hello")"""
        return self.invoke(prompt, **kwargs).content


def get_llm():
    """
    Factory function để khởi tạo LLM cho hệ thống.
    Ưu tiên tìm biến GOOGLE_API_KEY (chuẩn Google 2026).
    """
    # Lấy Key từ biến môi trường
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    
    # Model bạn vừa quét thấy, gemini-3-flash là lựa chọn cực tốt cho RAG
    model_name = os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")

    if api_key:
        try:
            return GeminiLLM(api_key=api_key, model_name=model_name)
        except Exception as e:
            print(f"[llm.py] Khởi tạo thất bại: {e}")
            traceback.print_exc()

    raise RuntimeError(
        "Không tìm thấy API Key. Hãy chạy lệnh: $env:GOOGLE_API_KEY='KEY_CUA_BAN'"
    )