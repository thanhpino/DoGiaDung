# 🏠 Gia Dụng TMT - Smart E-commerce Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![VNPAY](https://img.shields.io/badge/Payment-VNPAY-blue?style=for-the-badge)

> **Hệ thống thương mại điện tử chuyên cung cấp thiết bị gia dụng thông minh. Tích hợp thanh toán Online, thông báo Real-time, Chatbot thông minh**

👉 **Live Website:** [https://dogiadung-vwp8.onrender.com/](https://dogiadung-vwp8.onrender.com/)

---

## 📸 Screenshots

| Trang Chủ (Home) | Admin Dashboard (Real-time) |
|:---:|:---:|
| ![Home](public/screenshots/home.png) | ![Admin](public/screenshots/admin.png) |

| Thanh Toán VNPAY | Lịch Sử Đơn Hàng |
|:---:|:---:|
| ![Payment](public/screenshots/vnpay.png) | ![History](public/screenshots/history.png) |

---

## 🛠️ Công Nghệ & Kỹ Thuật (Tech Stack)

### **(Client)**
* **Core:** ReactJS (Vite), TypeScript.
* **Styling:** TailwindCSS, Lucide React (Icons).
* **Real-time:** Socket.io-client.
* **State Management:** React Context API.
* **Notifications:** React Hot Toast (Custom UI).

### **(Server)**
* **Runtime:** Node.js, Express.js.
* **Database:** MySQL 8.0.
* **Real-time:** Socket.io Server.
* **Payment Gateway:** Tích hợp **VNPAY**, Momo, Zalopay, PayPal.
* **Testing:** **Jest** & **Supertest**.
* **Security:** `bcryptjs`, Custom Auth Session.
* **Features:** Nodemailer, Multer.

### **DevOps & Deployment**
* **Containerization:** Docker & Docker Compose.
* **Cloud:** Render.

---

## ✨ Tính Năng Nổi Bật (Key Features)

### 👤 Dành cho Khách Hàng (User)
- [x] **Smart Chatbot:** Hỗ trợ tìm kiếm theo ngữ cảnh (ví dụ: "tìm nồi giá rẻ", "phí ship thế nào?"), trả lời ngẫu nhiên tự nhiên.
- [x] **Thanh toán Đa dạng:** Hỗ trợ COD (Tiền mặt) và **Thanh toán Online qua VNPAY**.
- [x] **Giỏ hàng Real-time:** Cập nhật trạng thái, tính tổng tiền, gửi Email xác nhận đơn hàng tự động.
- [x] **Tìm kiếm & Lọc:** Tìm theo tên, danh mục, khoảng giá.


### 🛡️ Dành cho Quản Trị Viên (Admin)
- [x] **Thông báo Thời gian thực (Real-time):** Admin nhận thông báo **"Ting ting"** ngay lập tức khi có khách đặt hàng.
- [x] **Dashboard Trực quan:** Biểu đồ doanh thu tuần, Top sản phẩm bán chạy.
- [x] **Quản lý toàn diện:** Sản phẩm, Khách hàng, Đơn hàng (Cập nhật trạng thái giao hàng).

---

## 🚀 Hướng Dẫn Cài Đặt

Bạn có thể chạy dự án theo 2 cách: **Docker ** hoặc **Thủ công**.

### Cách 1: Chạy bằng Docker
Yêu cầu: Đã cài Docker Desktop.

```bash
# 1. Clone dự án
git clone [https://github.com/username/dogiadung-main.git](https://github.com/username/dogiadung-main.git)
cd dogiadung-main

# 2. Tạo file .env cho Server (trong thư mục server/)

# 3. Khởi chạy toàn bộ hệ thống
docker-compose up --build

### Cách 2: Chạy Thủ công (Manual)
1. Setup Backend:
cd server
npm install

# Cấu hình .env
npm start

# Hoặc chạy test: npm test
2. Setup Frontend:
cd ..
npm install

# Cấu hình .env (VITE_API_URL=http://localhost:8081)
npm run dev

###🔐 Cấu Hình Biến Môi Trường (.env)
# --- DATABASE ---
DB_HOST=localhost       
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dogiadung_db
DB_PORT=3306            # (3306 nếu chạy thường, Docker sẽ map ra 3307)

# --- SERVER ---
PORT=8081
CLIENT_URL=http://localhost:5173

# --- EMAIL SERVICE ---
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# --- VNPAY PAYMENT  ---
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_secret_key
VNPAY_URL=[https://sandbox.vnpayment.vn/paymentv2/vpcpay.html](https://sandbox.vnpayment.vn/paymentv2/vpcpay.html)
VNPAY_RETURN_URL=http://localhost:5173/vnpay-return


### 🧪 Testing

cd server
npm test


👨‍💻 Tác Giả
Trương Minh Thành

MSSV: 524H0032

Trường: Ton Duc Thang University (TDTU)

Ngành: Kỹ thuật Phần mềm (Software Engineering)

Project for educational purpose.