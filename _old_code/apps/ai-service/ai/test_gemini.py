import os

from google import genai # Sử dụng SDK mới 2026

# 1. Khởi tạo Client (Thay thế cho genai.configure)
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
# GOOGLE_API_KEY=AIzaSyAIz9P-4AL-GVrqhllaF6q8KHjXSqD15xk
print("--- Danh sách các model bạn có thể dùng: ---")

try:
    # 2. Sử dụng client.models.list() thay cho genai.list_models()
    for m in client.models.list():
        # Kiểm tra nếu model này hỗ trợ tạo nội dung (generateContent)
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model ID: {m.name}")
            
except Exception as e:
    print(f"Lỗi hệ thống: {e}")