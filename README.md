# AGRI-SCAN AI | HỆ SINH THÁI NÔNG NGHIỆP | WDA2026

> **Dự án tham gia:** WebDev Adventure 2026

> **Đội thi:** UITxFPT.asa

> **Trạng thái:** Đang phát triển

<p align="center">
<a href="https://opensource.org/licenses/MIT">
<img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License MIT">
</a>
<img src="https://img.shields.io/badge/Open%20Source-Community-orange?style=for-the-badge" alt="Open Source">
<img src="https://img.shields.io/badge/Build-In%20Progress-yellow?style=for-the-badge" alt="Build Status">
<img src="https://img.shields.io/badge/Stack-NestJS%20%7C%20Next.js%20%7C%20Expo%20%7C%20Python%20%7C%20MongoDB-blue?style=for-the-badge" alt="Tech Stack">
</p>

## Quick Links

* **Source Code (tham khảo phiên bản trước):** [GitHub — AGRI-SCAN-AI-ASA](https://github.com/MITOM06/AGRI-SCAN-AI-ASA-)
* **Dataset:** [Rice Leaf Diseases Detection — Kaggle](https://www.kaggle.com/datasets/loki4514/rice-leaf-diseases-detection)
* **Dữ liệu đã chia (Train/Val/Test):** [Google Drive](https://drive.google.com/drive/folders/1Ebmeq0fpYecxsK6QEL-sqtjTGGQbUFB6?usp=sharing)

## Mục lục

* [I. Tổng quan dự án (Project Overview)](#i-tổng-quan-dự-án-project-overview)
* [II. Tính năng cốt lõi](#ii-tính-năng-cốt-lõi)
* [III. Giải pháp AI (AI Solutions)](#iii-giải-pháp-ai-ai-solutions)
* [IV. Kiến trúc hệ thống & Công nghệ](#iv-kiến-trúc-hệ-thống--công-nghệ)
* [V. Hạn chế hiện tại và định hướng phát triển](#v-hạn-chế-hiện-tại-và-định-hướng-phát-triển)
* [VI. Hướng dẫn cài đặt](#vi-hướng-dẫn-cài-đặt)
* [VII. Project Management & Liên hệ](#vii-project-management--liên-hệ)
* [VIII. Thiết kế cơ sở dữ liệu (tổng quan)](#viii-thiết-kế-cơ-sở-dữ-liệu-tổng-quan)

## I. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

### 1.1. Giới thiệu dự án

**Agri-Scan AI** là hệ sinh thái nông nghiệp thông minh khép kín, kết nối chẩn đoán AI, quản lý canh tác số và thương mại minh bạch. Hệ thống hướng tới nông dân, hợp tác xã và người tiêu dùng: từ “bác sĩ cây trồng” ảo, nhật ký vườn theo thời gian thực, tới sàn nông sản có thể truy xuất nguồn gốc.

### 1.2. Bối cảnh & Vấn đề (The Problem)

* **Chẩn đoán & xử lý bệnh:** Triệu chứng dễ nhầm, thiếu tư vấn kịp thời dẫn tới dùng thuốc sai, lãng phí và rủi ro môi trường.
* **Minh bạch chuỗi giá trị:** Người mua khó tin tưởng nguồn gốc nông sản; nông dân khó chứng minh chất lượng qua hành trình canh tác.
* **Phân mảnh công cụ:** Thông tin canh tác, AI và bán hàng thường nằm rời rạc, khó vận hành như một vòng khép kín.

### 1.3. Giải pháp (The Solution)

1. **Trợ lý AI (Chatbot):** Chẩn đoán bệnh qua ảnh và ngữ cảnh, tư vấn thuốc / biện pháp xử lý phù hợp.
2. **MyGarden — Hồ sơ canh tác:** Nhật ký số, theo dõi sức khỏe cây theo thời gian thực, trích xuất **QR minh bạch** gắn với lịch sử vườn.
3. **E-Farm — Sàn thương mại:** Chỉ niêm yết nông sản đạt chuẩn từ MyGarden; người mua **quét QR** để truy xuất nguồn gốc và hành trình canh tác.

### 1.4. Giá trị cốt lõi (Core Values)

* **Chính xác & an toàn:** AI đa tầng kết hợp tri thức (RAG) để giảm ảo giác và tăng độ tin cậy khuyến nghị.
* **Minh bạch:** QR và hồ sơ vườn là “hộ chiếu” cho từng lô nông sản.
* **Khép kín:** Backend, dịch vụ AI Python và client Web/Mobile cùng một kiến trúc monorepo, giao tiếp chuẩn hóa qua message broker.

### 1.5. Thành viên nhóm

<table align="center">
  <tr>
    <td align="center" valign="top" width="160px">
      <a href="https://github.com/tapu25z">
        <img src="https://github.com/tapu25z.png" width="100px" height="100px" style="border-radius: 50%; object-fit: cover;" alt="Bùi Huỳnh Tây"/><br />
        <div style="height: 8px;"></div>
        <sub><b>Bùi Huỳnh Tây</b></sub>
      </a><br />
      <div style="height: 5px;"></div>
      <sub style="display: block; min-height: 30px; line-height: 1.2;"><b>PM / AI Architecture</b></sub>
    </td>
    <td align="center" valign="top" width="160px">
      <a href="https://github.com/thanhnhanqn77">
        <img src="https://github.com/thanhnhanqn77.png" width="100px" height="100px" style="border-radius: 50%; object-fit: cover;" alt="Hà Lê Thành Nhân"/><br />
        <div style="height: 8px;"></div>
        <sub><b>Hà Lê Thành Nhân</b></sub>
      </a><br />
      <div style="height: 5px;"></div>
      <sub style="display: block; min-height: 30px; line-height: 1.2;"><b>AI Engineer</b></sub>
    </td>
    <td align="center" valign="top" width="160px">
      <a href="https://github.com/Tung-pro123">
        <img src="https://github.com/Tung-pro123.png" width="100px" height="100px" style="border-radius: 50%; object-fit: cover;" alt="Lê Thanh Tùng"/><br />
        <div style="height: 8px;"></div>
        <sub><b>Lê Thanh Tùng</b></sub>
      </a><br />
      <div style="height: 5px;"></div>
      <sub style="display: block; min-height: 30px; line-height: 1.2;"><b>Front-end Mobile</b></sub>
    </td>
    <td align="center" valign="top" width="160px">
      <a href="https://github.com/BangSonChau">
        <img src="https://github.com/BangSonChau.png" width="100px" height="100px" style="border-radius: 50%; object-fit: cover;" alt="Châu Băng Sơn"/><br />
        <div style="height: 8px;"></div>
        <sub><b>Châu Băng Sơn</b></sub>
      </a><br />
      <div style="height: 5px;"></div>
      <sub style="display: block; min-height: 30px; line-height: 1.2;"><b>Front-end Web</b></sub>
    </td>
    <td align="center" valign="top" width="160px">
      <a href="https://github.com/MITOM06">
        <img src="https://github.com/MITOM06.png" width="100px" height="100px" style="border-radius: 50%; object-fit: cover;" alt="Trần Phúc Khang"/><br />
        <div style="height: 8px;"></div>
        <sub><b>Trần Phúc Khang</b></sub>
      </a><br />
      <div style="height: 5px;"></div>
      <sub style="display: block; min-height: 30px; line-height: 1.2;"><b>Back-end / DevOps</b></sub>
    </td>
  </tr>
</table>

| Thành viên | Vai trò |
| :--- | :--- |
| **Bùi Huỳnh Tây** | **PM / AI Architecture** |
| **Hà Lê Thành Nhân** | **AI Engineer** |
| **Lê Thanh Tùng** | **Front-end Mobile** |
| **Châu Băng Sơn** | **Front-end Web** |
| **Trần Phúc Khang** | **Back-end / DevOps** |

## II. TÍNH NĂNG CỐT LÕI

### 2.1. Chatbot — Trợ lý nông nghiệp

* Hỗ trợ hội thoại và phân tích ảnh (lá, thân, triệu chứng) để **chẩn đoán bệnh** và **tư vấn thuốc** / biện pháp xử lý.
* Tích hợp **RAG** trên cơ sở tri thức nông nghiệp nhằm giảm ảo giác và căn cứ khuyến nghị vào tài liệu tin cậy.

### 2.2. MyGarden — Hồ sơ canh tác

* **Nhật ký số** theo từng cây / lô vườn: ghi nhận sự kiện canh tác, chẩn đoán và can thiệp.
* **Theo dõi sức khỏe cây theo thời gian thực** (trạng thái, lịch sử bệnh, xu hướng phục hồi).
* **QR minh bạch:** Trích xuất mã QR gắn với hồ sơ vườn / lô đạt chuẩn, phục vụ truy xuất và niêm yết trên sàn.

### 2.3. E-Farm — Sàn thương mại

* **Chỉ bán nông sản đạt chuẩn** xuất phát từ **MyGarden** (chuẩn hóa theo dữ liệu canh tác và kiểm soát chất lượng).
* Người mua **quét QR** để **truy xuất nguồn gốc** và thông tin hành trình sản phẩm.

---

## III. GIẢI PHÁP AI (AI SOLUTIONS)

### 3.1. Luồng thị giác — YOLO ba tầng

Hệ thống nhận diện và phân tích ảnh cây trồng theo pipeline **YOLO 3 tầng**, tách bài toán thành các bước chuyên biệt:

1. **Detect:** Phát hiện vùng lá / bộ phận cây cần chú ý trong ảnh.
2. **Classify:** Phân loại loài cây hoặc ngữ cảnh canh tác phù hợp.
3. **Disease:** Xác định bệnh / tổn thương và mức độ tin cậy.

Cách tiếp cận này giúp tối ưu độ chính xác từng bước và dễ bảo trì khi mở rộng thêm lớp bệnh hoặc loại cây.

### 3.2. Ngôn ngữ & tri thức — vLLM + RAG

* **vLLM** phục vụ suy luận với mô hình **Qwen3.5-35B-A3B**, phù hợp tư vấn dài, giải thích và hội thoại đa lượt.
* **RAG (Retrieval-Augmented Generation):** Truy hồi tài liệu nông nghiệp / phác đồ điều trị trước khi sinh câu trả lời, tăng tính kiểm chứng và giảm “bịa” thông tin.

### 3.3. Tích hợp dịch vụ

Dịch vụ AI (Python) giao tiếp với **NestJS** qua **RabbitMQ** theo kiểu bất đồng bộ; kết quả vision và LLM được chuẩn hóa trước khi trả về client Web (**Next.js**) và Mobile (**React Native / Expo**).

---

## IV. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ

### 4.1. Monorepo (`pnpm`)

Mã nguồn tổ chức theo workspace:

* `apps/*` — ví dụ: **web** (Next.js), **mobile** (Expo), **api** (NestJS).
* `packages/*` — ví dụ: **ai-service** (Python).

### 4.2. Công nghệ lõi

| Lớp | Công nghệ |
| :--- | :--- |
| **API & nghiệp vụ** | **NestJS** |
| **AI & batch / worker** | **Python AI Service** |
| **Message broker** | **RabbitMQ** (NestJS ↔ Python) |
| **Dữ liệu** | **MongoDB** (cây trồng, người dùng, hồ sơ vườn, giao dịch…) |
| **Cache & phiên** | **Redis** (cache, refresh token, v.v.) |
| **Web** | **Next.js** |
| **Mobile** | **React Native (Expo)** |
| **Hạ tầng cục bộ** | **Docker** & **Docker Compose** (MongoDB, Redis, RabbitMQ trên mạng `agriscan_net`) |

### 4.3. Sơ đồ luồng (khái niệm)

```text
[Next.js / Expo]  →  [NestJS API]  ⇄  [RabbitMQ]  ⇄  [Python AI Service]
                           ↓                ↓
                      [MongoDB]         [YOLO / vLLM+RAG]
                           ↓
                      [Redis]
```

---

## V. HẠN CHẾ HIỆN TẠI VÀ ĐỊNH HƯỚNG PHÁT TRIỂN

### 5.1. Hạn chế

* Phiên bản đầu ưu tiên **MVP khép kín** ba trụ Chatbot — MyGarden — E-Farm; một số tính năng mở rộng (thời tiết nâng cao, cộng đồng, v.v.) sẽ lên lộ trình sau.
* Hiệu năng và chi phí suy luận **LLM lớn** phụ thuộc cấu hình GPU / nhà cung cấp vLLM; cần tối ưu batching và chính sách cache.

### 5.2. Định hướng

* Mở rộng tập bệnh / loài cây, tinh chỉnh YOLO theo dữ liệu Việt Nam.
* Chuẩn hóa metadata QR và API truy xuất cho bên thứ ba (hợp tác xã, nhà bán lẻ).
* CI/CD, quan sát (logging/metrics) và hardening bảo mật cho production.

---

## VI. HƯỚNG DẪN CÀI ĐẶT

### 6.1. Yêu cầu

* [Node.js](https://nodejs.org/) (khuyến nghị LTS) và [pnpm](https://pnpm.io/)
* [Docker](https://www.docker.com/) & Docker Compose

### 6.2. Hạ tầng cục bộ (MongoDB, Redis, RabbitMQ)

Tại thư mục gốc repository:

```bash
docker compose up -d
```

Các dịch vụ expose port mặc định: MongoDB `27017`, Redis `6379`, RabbitMQ `5672` và giao diện quản trị `15672` (xem `docker-compose.yml`).

### 6.3. Monorepo

```bash
pnpm install
```

Hướng dẫn chi tiết cho từng app (`apps/web`, `apps/mobile`, `apps/api`) và `packages/ai-service` sẽ được bổ sung khi các package có script khởi chạy chính thức.

---

## VII. PROJECT MANAGEMENT & LIÊN HỆ

| Vai trò | Thông tin |
| :--- | :--- |
| **Project Manager** | **Bùi Huỳnh Tây** |
| **GitHub** | [tapu25z](https://github.com/tapu25z) |
| **Email** | huynhtaybui@gmail.com |

**Đội UITxFPT.asa** — WebDev Adventure 2026.

---

## VIII. THIẾT KẾ CƠ SỞ DỮ LIỆU (TỔNG QUAN)

Dự án sử dụng **MongoDB**, ưu tiên mô hình tài liệu linh hoạt cho người dùng, cây trồng, nhật ký vườn, lịch sử chẩn đoán, phiên chat và dữ liệu phục vụ **QR / truy xuất nguồn gốc** trên E-Farm.

Các collection chi tiết (schema, index, quan hệ tham chiếu) sẽ được cập nhật đồng bộ với mã `apps/api` khi module tương ứng hoàn thiện. Tham khảo thiết kế đề xuất từ phiên bản trước tại [`_old_code/README.md`](_old_code/README.md) (mục VIII).

---
