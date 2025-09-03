# Yêu cầu Kiểm thử (Test Requirements) - Trang Chi tiết Đội (Team Detail Page)

Bảng này liệt kê các yêu cầu kiểm thử chi tiết cho chức năng của Trang Chi tiết Đội.

| ID | Requirement (English) | Yêu cầu (Tiếng Việt) | Loại (Type) |
| :--- | :--- | :--- | :--- |
| **TR-TD-F-01** | **Team Information is Displayed Correctly** | **Thông tin đội được hiển thị chính xác** | **Functional** |
| TR-TD-F-01.1 | The team's name and description must be correctly shown at the top of the page. | Tên và mô tả của đội phải được hiển thị chính xác ở đầu trang. | Functional |
| TR-TD-F-01.2 | The list of team members must display each member's avatar, name, and role. | Danh sách thành viên đội phải hiển thị ảnh đại diện, tên và vai trò của mỗi thành viên. | Functional |
| TR-TD-F-01.3 | The "Team Leader" role must have a visual indicator (e.g., a crown icon) next to their name. | Vai trò 'Trưởng nhóm' phải có một chỉ báo trực quan (ví dụ: biểu tượng vương miện) bên cạnh tên. | Functional |
| TR-TD-F-01.4 | The project progress bar must accurately reflect the percentage of completed tasks. | Thanh tiến độ dự án phải phản ánh chính xác phần trăm công việc đã hoàn thành. | Functional |
| TR-TD-F-01.5 | All tasks belonging to the team must be displayed in the "Current Tasks" section. | Tất cả công việc thuộc về đội phải được hiển thị trong mục "Công việc hiện tại". | Functional |
| **TR-TD-F-02** | **Member Management Functionality** | **Chức năng Quản lý Thành viên** | **Functional** |
| TR-TD-F-02.1 | A Team Leader must be able to add a new user to the team. | Một Trưởng nhóm phải có thể thêm một người dùng mới vào đội. | Functional |
| TR-TD-F-02.2 | A Team Leader must be able to remove a member from the team. | Một Trưởng nhóm phải có thể xóa một thành viên khỏi đội. | Functional |
| TR-TD-F-02.3 | A Team Leader must be able to change a member's role from "Member" to "Team Leader" and vice versa. | Một Trưởng nhóm phải có thể thay đổi vai trò của một thành viên từ 'Thành viên' sang 'Trưởng nhóm' và ngược lại. | Functional |
| TR-TD-F-02.4 | A regular "Member" must not see the options to add, remove, or change roles of other members. | Một 'Thành viên' thông thường không được thấy các tùy chọn để thêm, xóa, hoặc thay đổi vai trò của các thành viên khác. | Functional |
| **TR-TD-F-03** | **Analytics Tab Functionality** | **Chức năng của Tab Phân tích** | **Functional** |
| TR-TD-F-03.1 | The "Member Performance" chart must correctly display the number of tasks (To do, In Progress, Done) for each member. | Biểu đồ "Hiệu suất thành viên" phải hiển thị chính xác số lượng công việc (Cần làm, Đang làm, Hoàn thành) cho mỗi thành viên. | Functional |
| TR-TD-F-03.2 | The "Task Type Distribution" pie chart must accurately show the proportion of tasks by type (Feature, Bug, Task). | Biểu đồ tròn "Phân loại công việc" phải hiển thị chính xác tỷ lệ các loại công việc (Tính năng, Lỗi, Công việc). | Functional |
| **TR-TD-L-04** | **UI is Clear and Professional** | **Giao diện rõ ràng và chuyên nghiệp** | **Look and Feel** |
| TR-TD-L-04.1 | Charts and graphs must be easy to read and have clear labels. | Các biểu đồ phải dễ đọc và có nhãn rõ ràng. | Look and Feel |
| TR-TD-L-04.2 | A loading skeleton should be displayed while team data is being fetched. | Một bộ khung sườn (skeleton) tải trang nên được hiển thị trong khi dữ liệu của đội đang được lấy về. | Look and Feel |
| TR-TD-L-04.3 | Dialogs for adding members or editing the team must be styled consistently with the rest of the application. | Các hộp thoại để thêm thành viên hoặc chỉnh sửa đội phải được tạo kiểu nhất quán với phần còn lại của ứng dụng. | Look and Feel |
| **TR-TD-B-05** | **System Handles Boundary Values** | **Hệ thống xử lý đúng các giá trị biên** | **Boundary** |
| TR-TD-B-05.1 | The page must display correctly if a team has no tasks. All charts should show an "empty state". | Trang phải hiển thị chính xác nếu một đội không có công việc nào. Tất cả các biểu đồ nên hiển thị "trạng thái rỗng". | Boundary |
| TR-TD-B-05.2 | The page must display correctly if a team has only one member (the leader). | Trang phải hiển thị chính xác nếu một đội chỉ có một thành viên (là trưởng nhóm). | Boundary |
| TR-TD-B-05.3 | The member list should handle a large number of members (e.g., 50+) gracefully, possibly with a scrollbar. | Danh sách thành viên nên xử lý một số lượng lớn thành viên (ví dụ: 50+) một cách mượt mà, có thể bằng thanh cuộn. | Boundary |
| **TR-TD-N-06** | **System Handles Negative Scenarios** | **Hệ thống xử lý tốt các tình huống không mong muốn** | **Negative** |
| TR-TD-N-06.1 | Attempting to change the role of the last Team Leader to "Member" should be prevented with an error message. | Cố gắng thay đổi vai trò của Trưởng nhóm cuối cùng thành 'Thành viên' phải bị ngăn chặn và hiển thị thông báo lỗi. | Negative |
| TR-TD-N-06.2 | A non-member attempting to access a team page via URL should be redirected or shown a "not authorized" message. | Một người không phải là thành viên cố gắng truy cập trang của đội qua URL nên bị chuyển hướng hoặc thấy thông báo "không có quyền". | Negative |
| TR-TD-N-06.3 | If fetching team data fails, a proper error message must be displayed instead of a broken page. | Nếu việc lấy dữ liệu đội thất bại, một thông báo lỗi phù hợp phải được hiển thị thay vì một trang bị lỗi. | Negative |
| TR-TD-N-06.4 | The "Add Member" dropdown should not list users who are already in the team. | Hộp thoại "Thêm thành viên" không nên liệt kê những người dùng đã có trong đội. | Negative |
