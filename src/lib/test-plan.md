## 🧩 Test Plan Template (Mẫu Kế Hoạch Kiểm Thử)

### 1. Thông Tin Chung
- **Tên dự án:** TeamFlow
- **Người lập Test Plan:** Gemini (AI Assistant)
- **Ngày tạo:** ...
- **Phiên bản:** v0.1.0
- **Cập nhật lần cuối:** ...

### 2. Giới Thiệu
- **Mục đích:** Đảm bảo ứng dụng TeamFlow hoạt động ổn định, an toàn và thân thiện với người dùng, đáp ứng đúng các yêu cầu chức năng được mô tả trong tài liệu dự án, và xác minh rằng các luồng nghiệp vụ cốt lõi không có lỗi nghiêm trọng trước khi triển khai.
- **Tài liệu tham chiếu:**
    - `README.md`
    - `backend-api-design.md`
    - `test-requirements-*.md` (Analytics, Dashboard, Home, Team-Detail, Tour)

### 3. Phạm Vi Kiểm Thử (Scope)
- **Trong phạm vi (In-Scope):**
    - **Xác thực người dùng:** Đăng nhập, Đăng ký, Đăng xuất.
    - **Quản lý công việc:**
        - Tạo công việc mới.
        - Xem chi tiết công việc.
        - Cập nhật công việc (thay đổi trạng thái, tiêu đề, mô tả, người được giao...).
        - Xóa công việc.
        - Lọc và tìm kiếm công việc trên Bảng điều khiển.
    - **Quản lý đội nhóm:**
        - Tạo đội mới.
        - Xem chi tiết đội và danh sách thành viên.
        - Thêm/xóa thành viên.
        - Thay đổi vai trò thành viên.
    - **Chức năng khác:**
        - Trang chủ (Dashboard cá nhân).
        - Trang báo cáo & phân tích.
        - Cài đặt người dùng và giao diện.
        - Chức năng hướng dẫn sử dụng (Tour Guide).

- **Ngoài phạm vi (Out-of-Scope):**
    - Chức năng "Quên mật khẩu".
    - Tích hợp với các dịch vụ bên thứ ba (VD: Google Calendar).
    - Đánh giá chất lượng và tính chính xác của nội dung do AI tạo ra.
    - Kiểm thử hiệu năng (Performance/Load Testing).
    - Kiểm thử bảo mật chuyên sâu (Security Penetration Testing).


### 4. Mục Tiêu Chất Lượng
- Ứng dụng đáp ứng tất cả yêu cầu chức năng trong các tệp `test-requirements-*.md`.
- Không còn lỗi nghiêm trọng (blocker/critical) nào tồn tại trên các luồng nghiệp vụ chính.
- Giao diện người dùng hiển thị nhất quán, đáp ứng tốt trên các kích thước màn hình phổ biến (desktop, mobile).

### 5. Phương Pháp Kiểm Thử (Testing Approach)
- **Mô hình phát triển:** Agile (Giả định)
- **Loại kiểm thử:**
    - Manual Testing (Hộp đen): Dựa trên các kịch bản kiểm thử đã định nghĩa.
    - Kiểm thử Giao diện (UI/UX) và Tính tương thích (Compatibility).
- **Chiến lược:** Kiểm thử từng chức năng đã hoàn thiện. Thực hiện kiểm thử hồi quy (Regression Test) sau mỗi lần sửa lỗi hoặc thêm tính năng mới.

### 6. Vai Trò Và Trách Nhiệm
| Vai trò      | Người phụ trách         | Trách nhiệm                                      |
|-------------|-------------------------|--------------------------------------------------|
| QA Engineer | Gemini (AI Assistant)   | Thực thi các kịch bản kiểm thử, báo cáo kết quả. |
| Developer   | ... *(Người dùng/Bạn)*  | Sửa lỗi dựa trên báo cáo.                        |
| PM          | ... *(Người dùng/Bạn)*  | Xác nhận lỗi, ưu tiên và phê duyệt các bản sửa.   |


### 7. Tài Nguyên
- **Công cụ:** Trình duyệt web (Chrome, Firefox), Chrome DevTools.
- **Môi trường kiểm thử:**
    - **OS:** ...
    - **Browser:** Các phiên bản trình duyệt hiện đại.
    - **Device:** PC, Mobile (qua chế độ responsive của trình duyệt).
- **Dữ liệu kiểm thử:** Dữ liệu được tạo sẵn bởi `seedDatabase` trong `src/lib/mongodb.ts`.

### 8. Tiêu Chí Tạm Dừng / Tiếp Tục / Hoàn Thành
- **Tạm dừng:** Khi một lỗi nghiêm trọng (blocker) xuất hiện, làm chặn các luồng kiểm thử khác.
- **Tiếp tục:** Sau khi lỗi blocker đã được sửa và xác minh.
- **Hoàn thành:**
    - ≥ 95% test case trong phạm vi đạt "Passed".
    - Không còn lỗi nghiêm trọng nào chưa được giải quyết.

### 9. Lịch Trình Kiểm Thử
... *(Phần này cần được xác định dựa trên kế hoạch phát triển thực tế)*

### 10. Rủi Ro Và Giảm Thiểu
| Rủi ro                                | Ảnh hưởng                             | Cách giảm thiểu                                                   |
|---------------------------------------|---------------------------------------|--------------------------------------------------------------------|
| Thay đổi yêu cầu giữa chừng           | Phải viết lại test case, chậm tiến độ | Trao đổi thường xuyên để cập nhật và điều chỉnh kế hoạch kiểm thử. |
| Môi trường test không ổn định         | Kết quả kiểm thử không chính xác      | Đảm bảo môi trường phát triển cục bộ ổn định trước khi kiểm thử.    |
| Lỗi logic ở tầng back-end (actions.ts) | Chức năng hoạt động sai               | Phân tích kỹ lưỡng các file `actions.ts` khi có lỗi xảy ra.        |

### 11. Quản Lý Thay Đổi (Change Management)
Mọi thay đổi trong kế hoạch kiểm thử sẽ được ghi nhận và yêu cầu thảo luận lại.

### 12. Phụ Lục
- **Liên kết tài liệu:** `README.md`, `test-requirements-*.md`.
