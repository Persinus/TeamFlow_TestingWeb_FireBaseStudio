# TeamFlow - Ứng dụng Quản lý Công việc và Đội nhóm bằng AI

![TeamFlow Screenshot](https://picsum.photos/1200/600?random=1)

**TeamFlow** là một ứng dụng web full-stack hiện đại, được xây dựng bằng Next.js, được thiết kế để giúp các đội nhóm quản lý công việc, theo dõi tiến độ và cộng tác một cách hiệu quả. Ứng dụng tích hợp các tính năng AI thông minh để hỗ trợ các quy trình làm việc, chẳng hạn như đề xuất người thực hiện và tự động tạo mô tả công việc.

---

## ✨ Các tính năng nổi bật

*   **Quản lý Công việc Trực quan:** Bảng Kanban hỗ trợ kéo-thả giúp dễ dàng thay đổi trạng thái công việc (`Tồn đọng`, `Cần làm`, `Đang làm`, `Hoàn thành`).
*   **Nhiều Chế độ xem:** Xem công việc dưới dạng Bảng Kanban, Lịch (theo ngày hết hạn) hoặc Dòng thời gian (Timeline) để có cái nhìn tổng quan về dự án.
*   **Quản lý Đội nhóm:** Tạo các đội, thêm/xóa thành viên, và phân quyền (Trưởng nhóm, Thành viên).
*   **Tích hợp AI với Genkit:**
    *   **Tự động tạo Mô tả:** AI giúp tạo mô tả công việc chi tiết từ một vài từ khóa.
    *   **Gợi ý Người thực hiện:** AI phân tích chuyên môn và khối lượng công việc của các thành viên để đề xuất người phù hợp nhất cho một nhiệm vụ.
*   **Giao diện Tùy chỉnh:** Nhiều chủ đề màu sắc (Sáng, Tối, Ocean, Forest, Tương phản cao) để cá nhân hóa trải nghiệm.
*   **Phân tích và Thống kê:** Các biểu đồ trực quan giúp theo dõi hiệu suất của đội và phân bổ công việc.
*   **Thiết kế Đáp ứng (Responsive):** Giao diện được tối ưu hóa để hoạt động mượt mà trên cả máy tính và thiết bị di động.
*   **Xác thực An toàn:** Hệ thống đăng nhập an toàn, phân quyền người dùng.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

*   **Framework:** [Next.js](https://nextjs.org/) (sử dụng App Router)
*   **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
*   **Giao diện người dùng (UI):** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/)
*   **Cơ sở dữ liệu:** [MongoDB](https://www.mongodb.com/)
*   **Tương tác với DB:** [Mongoose](https://mongoosejs.com/)
*   **Xử lý Logic Phía Server:** Next.js Server Actions
*   **Trí tuệ nhân tạo (AI):** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
*   **Quản lý Trạng thái:** React Hooks & Context API
*   **Kéo & Thả:** [dnd-kit](https://dndkit.com/)
*   **Biểu đồ:** [Recharts](https://recharts.org/)

---

## 🛠️ Cài đặt và Chạy dự án

Để chạy dự án này trên máy cục bộ của bạn, hãy làm theo các bước sau:

### 1. Yêu cầu hệ thống

*   [Node.js](https://nodejs.org/en) (phiên bản 18.x trở lên)
*   `npm` hoặc `yarn`
*   Một chuỗi kết nối MongoDB (từ MongoDB Atlas hoặc một instance local)
*   Một khóa API của Google AI (cho các tính năng của Genkit)

### 2. Các bước cài đặt

**a. Clone repository:**
```bash
git clone <URL_CUA_REPOSITORY>
cd <TEN_THU_MUC_DU_AN>
```

**b. Cài đặt các dependencies:**
```bash
npm install
```

**c. Thiết lập biến môi trường:**

Tạo một tệp tên là `.env` ở thư mục gốc của dự án và thêm các biến sau:

```env
# Chuỗi kết nối đến cơ sở dữ liệu MongoDB của bạn
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

# Khóa API của bạn từ Google AI Studio
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**d. Chạy server development:**

Để chạy ứng dụng Next.js và server Genkit cùng lúc, bạn cần mở hai cửa sổ terminal:

*   **Terminal 1 (Chạy ứng dụng Next.js):**
    ```bash
    npm run dev
    ```
    Ứng dụng sẽ chạy tại `http://localhost:9002`.

*   **Terminal 2 (Chạy Genkit cho AI):**
    ```bash
    npm run genkit:watch
    ```
    Điều này sẽ khởi động server Genkit và tự động tải lại khi có thay đổi trong các tệp flow.

### 3. Tài khoản mặc định

Sau khi seed dữ liệu lần đầu, bạn có thể đăng nhập bằng tài khoản sau:
-   **Email:** `admin@teamflow.com`
-   **Mật khẩu:** `Admin@1234`

---

## 📄 Giấy phép (License)

Dự án này được cấp phép theo **Giấy phép MIT**. Xem chi tiết tại tệp `LICENSE`.

```