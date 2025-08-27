# Thiết kế Back-end cho Ứng dụng Quản lý Công việc TeamFlow

Tài liệu này mô tả chi tiết kiến trúc back-end được đề xuất để hỗ trợ ứng dụng front-end TeamFlow.

## 1. Sơ đồ Cơ sở dữ liệu (Database Schema)

Cơ sở dữ liệu sẽ bao gồm các bảng (hoặc collections trong NoSQL) chính: `Users`, `Teams`, và `Tasks`.

---

### Bảng `Users`
Lưu trữ thông tin về tất cả người dùng trong hệ thống.

| Tên cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID / ObjectID | **Khóa chính**, định danh duy nhất cho người dùng. |
| `name` | String | Tên đầy đủ của người dùng. |
| `email` | String | Email dùng để đăng nhập (phải là duy nhất). |
| `password` | String | Mật khẩu đã được mã hóa (ví dụ: bcrypt). |
| `avatar` | String | URL tới ảnh đại diện của người dùng. |
| `expertise`| String | Mô tả ngắn về chuyên môn (ví dụ: "Frontend Development"). |
| `phone` | String | Số điện thoại (tùy chọn). |
| `dob` | String / Date | Ngày sinh (tùy chọn, lưu dưới dạng ISO String). |
| `createdAt` | Timestamp | Thời gian tạo tài khoản. |
| `updatedAt` | Timestamp | Thời gian cập nhật thông tin lần cuối. |

---

### Bảng `Teams`
Lưu trữ thông tin về các nhóm làm việc.

| Tên cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID / ObjectID | **Khóa chính**, định danh duy nhất cho nhóm. |
| `name` | String | Tên của nhóm. |
| `description`| Text | Mô tả ngắn về mục tiêu và nhiệm vụ của nhóm. |
| `members` | Array of Objects | Danh sách các thành viên trong nhóm. |
| `createdAt` | Timestamp | Thời gian tạo nhóm. |
| `updatedAt` | Timestamp | Thời gian cập nhật lần cuối. |

**Cấu trúc một phần tử trong mảng `members`:**
```json
{
  "userId": "UUID / ObjectID", // Tham chiếu tới Users.id
  "role": "leader" | "member"
}
```

---

### Bảng `Tasks`
Lưu trữ tất cả các công việc trong dự án.

| Tên cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID / ObjectID | **Khóa chính**, định danh duy nhất cho công việc. |
| `title` | String | Tiêu đề của công việc. |
| `description`| Text | Mô tả chi tiết về công việc. |
| `status` | Enum | Trạng thái: `'backlog'`, `'todo'`, `'in-progress'`, `'done'`. |
| `teamId` | UUID / ObjectID | **Khóa ngoại**, liên kết tới `Teams.id`. |
| `assigneeId` | UUID / ObjectID | **Khóa ngoại**, liên kết tới `Users.id` (có thể null). |
| `tags` | Array of Strings | Danh sách các nhãn (tags) để phân loại. |
| `startDate` | Timestamp | Ngày bắt đầu dự kiến (tùy chọn). |
| `dueDate` | Timestamp | Ngày hết hạn (tùy chọn). |
| `createdAt` | Timestamp | Thời gian tạo công việc. |
| `updatedAt` | Timestamp | Thời gian cập nhật lần cuối. |

---

## 2. Thiết kế các Endpoint của API

Tất cả các endpoint nên được bảo vệ và yêu cầu token xác thực (ví dụ: JWT), trừ các endpoint đăng ký/đăng nhập.

### `/api/auth` (Xác thực)
- `POST /register`: Nhận `name`, `email`, `password`. Tạo người dùng mới.
- `POST /login`: Nhận `email`, `password`. Xác thực và trả về JWT token.
- `GET /me`: Yêu cầu token. Trả về thông tin người dùng đang đăng nhập.
- `POST /logout`: Hủy token hiện tại.

### `/api/users` (Người dùng)
- `GET /`: Lấy danh sách tất cả người dùng (chỉ các thông tin công khai).
- `PUT /:userId`: Yêu cầu token. Cập nhật thông tin cá nhân (tên, avatar, SĐT...).

### `/api/teams` (Đội nhóm)
- `GET /`: Lấy danh sách các nhóm mà người dùng hiện tại là thành viên.
- `POST /`: Nhận `name`, `description`. Tạo nhóm mới và gán người tạo làm `leader`.
- `GET /:teamId`: Lấy thông tin chi tiết một nhóm (bao gồm danh sách thành viên đầy đủ).
- `PUT /:teamId`: Cập nhật thông tin của nhóm (tên, mô tả).
- `DELETE /:teamId`: Xóa một nhóm.
- `POST /:teamId/members`: Nhận `userId` và `role`. Thêm thành viên mới vào nhóm.
- `DELETE /:teamId/members/:userId`: Xóa thành viên khỏi nhóm.
- `PUT /:teamId/members/:userId`: Nhận `role`. Cập nhật vai trò của thành viên.

### `/api/tasks` (Công việc)
- `GET /`: Lấy danh sách công việc. Hỗ trợ lọc qua query params: `?teamId={id}`, `?assigneeId={id}`, `?status={status}`.
- `POST /`: Nhận dữ liệu công việc để tạo mới.
- `GET /:taskId`: Lấy thông tin chi tiết một công việc.
- `PUT /:taskId`: Cập nhật một công việc đã có.
- `DELETE /:taskId`: Xóa một công việc.

### `/api/tags` (Nhãn)
- `GET /`: Lấy danh sách tất cả các nhãn (tags) đã được sử dụng trong hệ thống.

### `/api/ai` (Tính năng AI)
- `POST /suggest-assignee`: Nhận `taskDescription` và `teamMembers`. Trả về gợi ý người thực hiện phù hợp nhất cho công việc.
