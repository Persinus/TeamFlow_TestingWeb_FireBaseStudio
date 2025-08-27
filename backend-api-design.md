# Thiết kế Back-end cho Ứng dụng TeamFlow

Tài liệu này mô tả chi tiết kiến trúc back-end gợi ý để phục vụ cho ứng dụng front-end TeamFlow. Bạn có thể sử dụng bất kỳ ngôn ngữ hoặc framework nào (Node.js/Express, Python/Django, Go,...) để triển khai.

## 1. Sơ đồ Cơ sở dữ liệu (Database Schema)

Cơ sở dữ liệu sẽ bao gồm các bảng (hoặc collections trong NoSQL) sau: `Users`, `Teams`, `Tasks`, và một bảng trung gian `TeamMembers`.

---

### Bảng `Users`
Lưu trữ thông tin về tất cả người dùng trong hệ thống.

| Tên cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID / ObjectID | Khóa chính, định danh duy nhất. |
| `name` | String | Tên đầy đủ của người dùng. |
| `email` | String | Email dùng để đăng nhập (phải là duy nhất). |
| `password` | String | Mật khẩu đã được mã hóa (ví dụ: bcrypt). |
| `avatar` | String | URL tới ảnh đại diện của người dùng. |
| `expertise` | String | Mô tả ngắn về chuyên môn (ví dụ: "Frontend Development"). |
| `createdAt` | Timestamp | Thời gian tạo tài khoản. |
| `updatedAt` | Timestamp | Thời gian cập nhật thông tin lần cuối. |

---

### Bảng `Teams`
Lưu trữ thông tin về các nhóm làm việc.

| Tên cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID / ObjectID | Khóa chính. |
| `name` | String | Tên của nhóm. |
| `description`| Text | Mô tả ngắn về mục tiêu của nhóm. |
| `createdAt` | Timestamp | Thời gian tạo nhóm. |
| `updatedAt` | Timestamp | Thời gian cập nhật lần cuối. |

---

### Bảng `TeamMembers` (Bảng trung gian)
Đây là bảng quan trọng để tạo mối quan hệ nhiều-nhiều giữa `Users` và `Teams`.

| Tên cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `teamId` | UUID / ObjectID | Khóa ngoại, liên kết tới `Teams.id`. |
| `userId` | UUID / ObjectID | Khóa ngoại, liên kết tới `Users.id`. |
| `role` | Enum | Vai trò của người dùng trong nhóm. Giá trị: `'leader'` hoặc `'member'`. |

_Cặp (`teamId`, `userId`) phải là duy nhất._

---

### Bảng `Tasks`
Lưu trữ tất cả các công việc trong dự án.

| Tên cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID / ObjectID | Khóa chính. |
| `title` | String | Tiêu đề của công việc. |
| `description`| Text | Mô tả chi tiết về công việc. |
| `status` | Enum | Trạng thái hiện tại. Giá trị: `'backlog'`, `'todo'`, `'in-progress'`, `'done'`. |
| `teamId` | UUID / ObjectID | Khóa ngoại, liên kết tới `Teams.id`. Xác định công việc thuộc nhóm nào. |
| `assigneeId` | UUID / ObjectID | Khóa ngoại, liên kết tới `Users.id`. Người thực hiện công việc (có thể null). |
| `tags` | Array of Strings | Danh sách các thẻ (tags) liên quan. |
| `startDate` | Timestamp | Ngày bắt đầu công việc (có thể null). |
| `dueDate` | Timestamp | Ngày hết hạn của công việc (có thể null). |
| `createdAt` | Timestamp | Thời gian tạo công việc. |
| `updatedAt` | Timestamp | Thời gian cập nhật lần cuối. |

---

## 2. Thiết kế các Endpoint của API

Các API nên được bảo vệ và yêu cầu token xác thực (ví dụ: JWT), trừ các endpoint đăng nhập/đăng ký.

### Authentication API (`/api/auth`)
- `POST /register`: Nhận `name`, `email`, `password`. Tạo người dùng mới trong bảng `Users`.
- `POST /login`: Nhận `email`, `password`. Xác thực người dùng, nếu thành công thì trả về một token.
- `GET /me`: Yêu cầu token. Trả về thông tin của người dùng đang đăng nhập.
- `POST /logout`: Hủy token hiện tại.

### Users API (`/api/users`)
- `GET /`: Lấy danh sách tất cả người dùng trong hệ thống (chỉ trả về các thông tin công khai như `id`, `name`, `avatar`, `expertise`).

### Teams API (`/api/teams`)
- `GET /`: Lấy danh sách các nhóm mà người dùng hiện tại là thành viên.
- `POST /`: Nhận `name`, `description`. Tạo một nhóm mới và tự động thêm người tạo làm 'leader' vào bảng `TeamMembers`.
- `GET /{teamId}`: Lấy thông tin chi tiết một nhóm, bao gồm cả danh sách thành viên (JOIN với bảng `Users` thông qua `TeamMembers`).
- `POST /{teamId}/members`: Nhận `userId`. Thêm một thành viên mới vào nhóm với vai trò 'member'.
- `DELETE /{teamId}/members/{userId}`: Xóa một thành viên khỏi nhóm.
- `PUT /{teamId}/members/{userId}`: Nhận `role`. Cập nhật vai trò của một thành viên.

### Tasks API (`/api/tasks`)
- `GET /`: Lấy danh sách công việc. Hỗ trợ các tham số query để lọc, ví dụ:
  - `?teamId={id}`: Lọc công việc theo nhóm.
  - `?assigneeId={id}`: Lọc công việc theo người thực hiện.
  - `?status=in-progress`: Lọc theo trạng thái.
- `POST /`: Nhận dữ liệu công việc (`title`, `teamId`, `assigneeId`...). Tạo một công việc mới.
- `PUT /{taskId}`: Nhận các trường cần cập nhật. Cập nhật một công việc đã có.

### Tags API (`/api/tags`)
- `GET /`: Lấy danh sách tất cả các thẻ (tags) duy nhất đã được sử dụng trong toàn bộ hệ thống để gợi ý cho người dùng.

