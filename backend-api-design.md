# Thiết kế Back-end cho Ứng dụng Quản lý Công việc TeamFlow

Tài liệu này mô tả chi tiết kiến trúc back-end được đề xuất cho ứng dụng TeamFlow, bao gồm thiết kế cơ sở dữ liệu, mối quan hệ, cấu trúc file gợi ý và các API endpoints.

## 1. Công nghệ đề xuất
- **Nền tảng:** Node.js
- **Framework:** Express.js
- **Cơ sở dữ liệu:** MongoDB (với Mongoose ODM)
- **Xác thực:** JSON Web Tokens (JWT)

---

## 2. Cấu trúc thư mục đề xuất (Express.js)
Đây là một cấu trúc thư mục gợi ý để tổ chức code phía back-end một cách rõ ràng và dễ bảo trì.
```
teamflow-backend/
|
├── src/
│   ├── api/
│   │   ├── routes/              // Định tuyến các endpoints
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── team.routes.js
│   │   │   └── task.routes.js
│   │   ├── controllers/         // Chứa logic xử lý request/response
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── team.controller.js
│   │   │   └── task.controller.js
│   │   ├── models/              // Định nghĩa Mongoose Schemas
│   │   │   ├── user.model.js
│   │   │   ├── team.model.js
│   │   │   └── task.model.js
│   │   └── middlewares/         // Các middleware (xác thực, error handling)
│   │       ├── auth.middleware.js
│   │       └── error.middleware.js
│   ├── config/                  // Chứa các file cấu hình
│   │   ├── db.config.js
│   │   └── index.js
│   ├── services/                // Logic nghiệp vụ phức tạp (nếu có)
│   │   └── ai.service.js        // Ví dụ: dịch vụ gọi AI để gợi ý
│   └── utils/                   // Các hàm tiện ích
│       └── apiError.js
|
├── .env                         // Biến môi trường
├── server.js                    // Điểm khởi đầu của server
└── package.json
```

---

## 3. Thiết kế Cơ sở dữ liệu (MongoDB)

### 3.1. Sơ đồ quan hệ

Mối quan hệ giữa các collection chính được thiết lập như sau:

- **Users ◄—► Teams (Nhiều-nhiều):** Một người dùng có thể tham gia nhiều nhóm, và một nhóm có nhiều người dùng. Mối quan hệ này được thực hiện bằng cách lưu một mảng các `ObjectId` của `User` trong collection `Teams`.
- **Teams —► Tasks (Một-nhiều):** Một nhóm có thể có nhiều công việc, nhưng mỗi công việc chỉ thuộc về một nhóm duy nhất. Điều này được thực hiện bằng cách lưu `ObjectId` của `Team` trong mỗi document của `Task`.
- **Users —► Tasks (Một-nhiều - với vai trò Assignee):** Một người dùng có thể được giao nhiều công việc, nhưng mỗi công việc chỉ được giao cho một người dùng. Điều này được thực hiện bằng cách lưu `ObjectId` của `User` (assignee) trong mỗi document của `Task`.

```
+-----------+       +-----------------+       +-----------+
|   Users   |<------|   Teams         |------>|   Tasks   |
|-----------|       |-----------------|       |-----------|
| _id       |  (M)  | _id             |  (1)  | _id       |
| name      |<---+  | name            |------>| teamId    | (Ref: Teams)
| email     |    |  | description     |       | title     |
| ...       |    |  | members         |       | ...       |
+-----------+    |  |  [{userId, role}]|       | assigneeId| (Ref: Users)
                 |  +-----------------+       +-----------+
                 |           ^
                 |           | (1)
                 +-----------+
                      (Assignee)
```

### 3.2. Giải thích và định nghĩa các Collections

#### Collection `Users`
- **Mục đích:** Lưu trữ thông tin về tất cả người dùng trong hệ thống. Đây là collection trung tâm cho việc xác thực và quản lý thông tin cá nhân.
- **Định nghĩa Schema (Mongoose):**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, // không trả về password khi query
  avatar: { type: String },
  expertise: { type: String },
  phone: { type: String },
  dob: { type: Date },
}, { timestamps: true });
```

#### Collection `Teams`
- **Mục đích:** Tổ chức người dùng vào các nhóm làm việc. Mỗi nhóm có thành viên với các vai trò khác nhau (leader, member) và là đơn vị sở hữu các công việc.
- **Định nghĩa Schema (Mongoose):**
```javascript
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['leader', 'member'], default: 'member' }
  }]
}, { timestamps: true });
```

#### Collection `Tasks`
- **Mục đích:** Lưu trữ tất cả các công việc. Mỗi công việc được liên kết chặt chẽ với một nhóm (`teamId`) và có thể được giao cho một thành viên cụ thể (`assigneeId`).
- **Định nghĩa Schema (Mongoose):**
```javascript
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress', 'done'],
    default: 'todo'
  },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Có thể null
  tags: [{ type: String }],
  startDate: { type: Date },
  dueDate: { type: Date }
}, { timestamps: true });
```

---

## 4. Thiết kế các Endpoint của API

Tất cả các endpoint (trừ đăng ký/đăng nhập) cần được bảo vệ bằng middleware xác thực JWT.

### `/api/auth` (Xác thực)
- `POST /register`: Nhận `name`, `email`, `password`. Tạo người dùng mới.
- `POST /login`: Nhận `email`, `password`. Xác thực và trả về JWT.
- `GET /me`: Yêu cầu token. Trả về thông tin người dùng đang đăng nhập.

### `/api/users` (Người dùng)
- `GET /`: Lấy danh sách tất cả người dùng (chỉ các thông tin công khai).
- `PUT /:userId`: Cập nhật thông tin cá nhân (tên, avatar, SĐT...).

### `/api/teams` (Đội nhóm)
- `GET /`: Lấy danh sách các nhóm mà người dùng hiện tại là thành viên.
- `POST /`: Nhận `name`, `description`. Tạo nhóm mới, gán người tạo làm `leader`.
- `GET /:teamId`: Lấy thông tin chi tiết một nhóm (bao gồm thông tin đầy đủ của thành viên qua populate).
- `PUT /:teamId`: Cập nhật thông tin nhóm (tên, mô tả).
- `DELETE /:teamId`: Xóa một nhóm (chỉ leader có quyền).
- `POST /:teamId/members`: Nhận `userId`. Thêm thành viên mới vào nhóm.
- `DELETE /:teamId/members/:userId`: Xóa thành viên khỏi nhóm.
- `PUT /:teamId/members/:userId`: Nhận `role`. Cập nhật vai trò của thành viên.

### `/api/tasks` (Công việc)
- `GET /`: Lấy danh sách công việc. Hỗ trợ lọc: `?teamId={id}`, `?assigneeId={id}`, `?status={status}`.
- `POST /`: Nhận dữ liệu công việc (`title`, `description`, `teamId`, ...) để tạo mới.
- `GET /:taskId`: Lấy thông tin chi tiết một công việc.
- `PUT /:taskId`: Cập nhật một công việc (`title`, `description`, `status`, `assigneeId`...).
- `DELETE /:taskId`: Xóa một công việc.

### `/api/ai` (Tính năng AI)
- `POST /suggest-assignee`: Nhận `taskDescription` và `teamId`. Trả về gợi ý người thực hiện phù hợp nhất.
