FROM python:3.10-slim

WORKDIR /app

# Quan trọng: Cài các thư viện hệ thống cần thiết cho Ultralytics (YOLO) và OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn AI vào
COPY . .

EXPOSE 8000

# Chạy FastAPI. 
# Lưu ý: Do main.py nằm trong thư mục ai/ (dựa theo project_tree của bạn), 
# ta cần gọi module là ai.main
CMD ["uvicorn", "ai.main:app", "--host", "0.0.0.0", "--port", "8000"]