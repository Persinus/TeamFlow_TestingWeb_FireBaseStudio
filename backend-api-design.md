# Thiết kế Back-end cho Ứng dụng Quản lý Công việc TeamFlow với Next.js

Tài liệu này mô tả chi tiết kiến trúc back-end được đề xuất cho ứng dụng TeamFlow, được xây dựng trực tiếp bên trong Next.js, tận dụng các tính năng full-stack của framework.

## 1. Công nghệ đề xuất
- **Nền tảng:** Next.js (App Router)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS & shadcn/ui
- **Cơ sở dữ liệu:** Mock data (hiện tại), có thể thay thế bằng các dịch vụ như Firebase Firestore, Supabase, hoặc bất kỳ cơ sở dữ liệu nào khác.
- **Xử lý tác vụ AI:** Genkit

---

## 2. Kiến trúc Back-end với Next.js

Next.js là một framework full-stack. Thay vì tạo một server Express.js riêng biệt, chúng ta sẽ tận dụng các tính năng tích hợp của Next.js để xử lý logic phía máy chủ.

### 2.1. Cấu trúc thư mục liên quan đến Back-end

Cấu trúc back-end được tích hợp ngay trong thư mục `src` của Next.js:

```
src/
|
├── app/
│   ├── actions.ts             // Định nghĩa các Server Actions để xử lý dữ liệu (CUD - Create, Update, Delete)
│   ├── api/                   // (Tùy chọn) Chứa các Route Handlers để tạo API endpoints truyền thống
│   │   └── ...
│   └── (routes)/              // Các component trang, bao gồm cả Server Components để lấy dữ liệu
│       └── page.tsx
|
├── ai/
|   ├── flows/                 // Chứa các flow Genkit để xử lý logic AI
|   |   └── suggest-task-assignee.ts
|   └── genkit.ts              // Cấu hình Genkit
|
├── lib/
│   └── data.ts                // Lớp truy cập dữ liệu (Data Access Layer). Giao tiếp với mock data.
│                              // Đây là nơi sẽ được thay đổi để kết nối với DB thật.
└── types.ts                   // Định nghĩa các kiểu dữ liệu chung (User, Task, Team)
```

### 2.2. Luồng xử lý dữ liệu

1.  **Lấy dữ liệu (Read):**
    *   Các **Server Components** (ví dụ: `src/app/page.tsx`) trực tiếp gọi các hàm trong `src/lib/data.ts` để lấy dữ liệu.
    *   Dữ liệu được fetch trên server và render thành HTML trước khi gửi xuống client, giúp tối ưu hiệu suất.

2.  **Thay đổi dữ liệu (Create, Update, Delete):**
    *   Client (ví dụ: một form trong component) gọi một **Server Action** được export từ `src/app/actions.ts`.
    *   Server Action này sẽ gọi các hàm tương ứng trong `src/lib/data.ts` để thay đổi dữ liệu (thêm, sửa, xóa).
    *   Sau khi thực hiện xong, Server Action có thể trả về kết quả hoặc Next.js có thể revalidate data để giao diện được cập nhật.

---

## 3. Thiết kế Cơ sở dữ liệu (Mô phỏng)

Mô hình dữ liệu được định nghĩa trong `src/types.ts` và được mô phỏng trong `src/lib/data.ts`.

### 3.1. Sơ đồ quan hệ

Mối quan hệ giữa các đối tượng chính:

- **Users ◄—► Teams (Nhiều-nhiều):** Một người dùng có thể tham gia nhiều nhóm, và một nhóm có nhiều thành viên.
- **Teams —► Tasks (Một-nhiều):** Một nhóm sở hữu nhiều công việc.
- **Users —► Tasks (Một-nhiều - với vai trò Assignee):** Một người dùng có thể được giao nhiều công việc.

```
+-----------+       +-----------------+       +-----------+
|   User    |<------|      Team       |------>|   Task    |
|-----------|       |-----------------|       |-----------|
| id        |  (M)  | id              |  (1)  | id        |
| name      |<---+  | name            |------>| teamId    | (Ref: Team)
| email     |    |  | description     |       | title     |
| avatar    |    |  | members         |       | ...       |
| ...       |    |  |  [{userId, role}]|       | assigneeId| (Ref: User)
+-----------+    |  +-----------------+       +-----------+
                 |           ^
                 |           | (1)
                 +-----------+
                      (Assignee)
```

### 3.2. Định nghĩa các kiểu dữ liệu (trong `src/types.ts`)

#### `User`
Lưu trữ thông tin người dùng.
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  expertise: string;
  currentWorkload: number;
  phone?: string;
  dob?: string;
}
```

#### `Team`
Tổ chức người dùng vào các nhóm làm việc.
```typescript
export type TeamMemberRole = 'leader' | 'member';

export interface Team {
  id:string;
  name: string;
  description?: string;
  members: { id: string; role: TeamMemberRole; }[];
}
```

#### `Task`
Lưu trữ các công việc, liên kết với một nhóm và có thể được giao cho một thành viên.
```typescript
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'backlog';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string; 
  assignee?: User; 
  teamId: string; 
  team: Team; 
  createdAt: string; // ISO string
  startDate?: string; // ISO string
  dueDate?: string; // ISO string
  tags?: string[];
}
```

---

## 4. Các hàm xử lý phía Server (Server Actions & Data Access)

### `src/lib/data.ts` (Data Access Layer)
Đây là lớp trừu tượng để tương tác với nguồn dữ liệu. Hiện tại đang dùng mock data, nhưng sau này có thể thay thế bằng lời gọi đến Firebase, Supabase, Prisma...
- `getUsers()`: Lấy danh sách tất cả người dùng.
- `getTeams()`: Lấy danh sách tất cả các nhóm.
- `getTeam(id)`: Lấy thông tin một nhóm theo ID.
- `createTeam(data, leaderId)`: Tạo nhóm mới.
- `updateTeam(id, data)`: Cập nhật thông tin nhóm.
- `deleteTeam(id)`: Xóa nhóm.
- `addTeamMember(teamId, userId)`: Thêm thành viên vào nhóm.
- `getTasks()`: Lấy tất cả công việc.
- `addTask(data)`: Tạo công việc mới.
- `updateTask(id, data)`: Cập nhật công việc.
- `updateTaskStatus(id, status)`: Cập nhật trạng thái công việc.

### `src/app/actions.ts` (Server Actions)
Các hàm này được gọi từ client để thực hiện các thay đổi dữ liệu một cách an toàn trên server.
- `getAssigneeSuggestion(input)`: Gọi flow AI để gợi ý người thực hiện.
- `getAllTags()`: Lấy danh sách các tag đã có.

Các actions khác để tạo/sửa/xóa task, team sẽ được thêm vào đây khi cần.

### `src/ai/flows/*.ts` (AI Flows)
- `suggestTaskAssignee(input)`: Sử dụng Genkit để nhận mô tả công việc và danh sách thành viên, sau đó trả về người được gợi ý dựa trên chuyên môn và khối lượng công việc.
