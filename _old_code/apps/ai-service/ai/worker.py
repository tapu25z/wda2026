"""
worker.py — File này là LEGACY (kiến trúc cũ).

⚠️  QUAN TRỌNG: File này KHÔNG được sử dụng trong kiến trúc hiện tại.
    Kiến trúc hiện tại là:
      NestJS AiScanConsumer → HTTP POST /predict, /chat → FastAPI (main.py)

    File worker.py chỉ được giữ lại để tham khảo hoặc nếu sau này team
    quyết định chuyển sang mô hình Python-as-consumer thay vì HTTP.

    Nếu muốn chạy worker.py, phải thêm lệnh sau vào docker-compose.yml:
      command: python -m ai.worker

    Bên dưới là phiên bản đã được sửa hết bug (BUG #5, #6, #7).
"""

import pika
import json
import base64
import io
import traceback
import os

from PIL import Image

# ═══════════════════════════════════════════════════════════════════
# BUG #6 FIX: Thiếu import VECTOR_DB, init_vector_db, query_vectorstore.
# Trong file cũ, process_chat_job dùng `global VECTOR_DB` và
# `init_vector_db()` nhưng không import → NameError khi chạy.
# ═══════════════════════════════════════════════════════════════════
from ai.model import predict_pil_image, load_yolo
from ai.rag import init_vector_db, query_vectorstore
from ai.llm import get_llm

# ═══════════════════════════════════════════════════════════════════
# BUG #6 FIX (tiếp): Khai báo VECTOR_DB ở cấp module.
# File cũ không có dòng này → VECTOR_DB undefined → NameError ngay
# ở dòng đầu tiên trong process_chat_job.
# ═══════════════════════════════════════════════════════════════════
VECTOR_DB = None

# Đọc URL từ env thay vì hardcode (dùng được cả local lẫn Docker)
RABBITMQ_URL = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")


def process_scan_job(ch, method, properties, body):
    """Nhận job từ scan_queue, xử lý, gửi kết quả về scan_result_queue"""
    data = {}
    try:
        data = json.loads(body)
        scan_id = data['scanId']
        image_b64 = data['imageBuffer']

        image_bytes = base64.b64decode(image_b64)
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        pred = predict_pil_image(pil_image, conf_threshold=0.0, top_k=1)
        top = pred.get('top', {})

        confidence = float(top.get('confidence', 0.0))
        yolo_label = top.get('label', '')

        if confidence < 0.5:
            result = {
                'scanId': scan_id,
                'success': False,
                'error': f'Độ tin cậy thấp ({confidence:.2f}). Vui lòng chụp rõ hơn.'
            }
        else:
            result = {
                'scanId': scan_id,
                'success': True,
                'yolo_label': yolo_label,
                'confidence': confidence,
            }

        # ═══════════════════════════════════════════════════════════
        # BUG #5 FIX: Dùng `ch` (tham số callback) thay vì `channel` (global).
        # File cũ dùng `channel.basic_publish(...)` nhưng `channel` chỉ
        # được assign trong __main__ block → UnboundLocalError nếu gọi
        # function này trước khi __main__ chạy, hoặc nếu dùng trong thread.
        # ═══════════════════════════════════════════════════════════
        ch.basic_publish(
            exchange='',
            routing_key='scan_result_queue',
            body=json.dumps(result),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[✓] Processed scan {scan_id}: {yolo_label} ({confidence:.2f})")

    except Exception as e:
        print(f"[✗] Error processing scan: {e}")
        traceback.print_exc()
        error_result = {'scanId': data.get('scanId', ''), 'success': False, 'error': str(e)}
        # BUG #5 FIX: Dùng ch thay vì channel
        ch.basic_publish(
            exchange='',
            routing_key='scan_result_queue',
            body=json.dumps(error_result),
        )
        ch.basic_ack(delivery_tag=method.delivery_tag)


def process_chat_job(ch, method, properties, body):
    """Nhận chat job, gọi LLM, gửi kết quả về chat_result_queue"""
    global VECTOR_DB
    data = {}
    try:
        data = json.loads(body)
        session_id = data['sessionId']
        label      = data.get('label', 'Cây trồng')
        question   = data['question']
        msg_index  = data['pendingMessageIndex']

        vs = VECTOR_DB if VECTOR_DB is not None else init_vector_db()
        search_query = f"Bệnh {label}: {question}"
        contexts = query_vectorstore(vs, search_query, k=4, filter_label=label)

        prompt_llm = (
            f"Bạn là chuyên gia nông nghiệp chuyên về bệnh cây trồng.\n"
            f"Kết quả nhận diện: **{label}**\n\n"
            f"Tài liệu liên quan:\n"
        )
        for c in contexts:
            prompt_llm += f"\n---\n{c['content']}\n"
        prompt_llm += (
            f"\nCâu hỏi: {question}\n"
            f"\nTrả lời chi tiết bằng tiếng Việt, định dạng Markdown rõ ràng."
        )

        llm = get_llm()
        if hasattr(llm, 'invoke'):
            res = llm.invoke(prompt_llm)
            answer_text = getattr(res, 'content', str(res))
        else:
            answer_text = llm(prompt_llm)

        result = {
            'sessionId': session_id,
            'pendingMessageIndex': msg_index,
            'success': True,
            'answer': answer_text,
        }

    except Exception as e:
        traceback.print_exc()
        result = {
            'sessionId': data.get('sessionId', ''),
            'pendingMessageIndex': data.get('pendingMessageIndex', 0),
            'success': False,
            'error': str(e),
        }

    # BUG #5 FIX: Dùng ch thay vì channel
    ch.basic_publish(
        exchange='',
        routing_key='chat_result_queue',
        body=json.dumps(result),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)
    print(f"[✓] Chat session {data.get('sessionId')} answered")


if __name__ == '__main__':
    # BUG #6 FIX: Init VECTOR_DB trước khi bắt đầu consuming
    VECTOR_DB = init_vector_db()

    load_yolo()
    print('[*] YOLO/ViT-MoE model loaded. Waiting for jobs...')

    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()

    channel.queue_declare(queue='scan_queue', durable=True)
    channel.queue_declare(queue='scan_result_queue', durable=True)

    # ═══════════════════════════════════════════════════════════════
    # BUG #7 FIX: Thiếu queue_declare cho chat_queue và chat_result_queue.
    # Nếu không declare, consumer sẽ crash khi cố basic_consume vào
    # queue chưa tồn tại.
    # ═══════════════════════════════════════════════════════════════
    channel.queue_declare(queue='chat_queue', durable=True)
    channel.queue_declare(queue='chat_result_queue', durable=True)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='scan_queue', on_message_callback=process_scan_job)
    channel.basic_consume(queue='chat_queue', on_message_callback=process_chat_job)

    print('[*] Workers ready. Press CTRL+C to exit.')
    channel.start_consuming()
