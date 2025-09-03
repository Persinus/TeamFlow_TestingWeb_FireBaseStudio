# Yêu cầu Kiểm thử (Test Requirements) - Bảng điều khiển Dự án (Project Dashboard)

Bảng này liệt kê các yêu cầu kiểm thử chi tiết cho chức năng Bảng điều khiển Dự án (Kanban Board).

| ID | Requirement (English) | Yêu cầu (Tiếng Việt) | Loại (Type) |
| :--- | :--- | :--- | :--- |
| **TR-DB-F-01** | **Tasks Display Correctly on the Board** | **Công việc được hiển thị chính xác trên bảng** | **Functional** |
| TR-DB-F-01.1 | All tasks must be displayed in the column that matches their current status (`Tồn đọng`, `Cần làm`, `Đang tiến hành`, `Hoàn thành`). | Tất cả công việc phải được hiển thị trong cột tương ứng với trạng thái hiện tại của chúng. | Functional |
| TR-DB-F-01.2 | The title, description, assignee avatar, and tags must be correctly shown on each task card. | Tiêu đề, mô tả, ảnh đại diện của người được giao và các thẻ phải được hiển thị đúng trên mỗi thẻ công việc. | Functional |
| TR-DB-F-01.3 | The task count for each status column must be accurate. | Số lượng công việc hiển thị trên đầu mỗi cột trạng thái phải chính xác. | Functional |
| **TR-DB-F-02** | **Drag and Drop Functionality Works** | **Chức năng Kéo và Thả hoạt động đúng** | **Functional** |
| TR-DB-F-02.1 | Dragging a task from one column to another must update the task's status in the database. | Kéo một công việc từ cột này sang cột khác phải cập nhật trạng thái của công việc trong cơ sở dữ liệu. | Functional |
| TR-DB-F-02.2 | The UI must optimistically update the task's position immediately after being dropped into a new column. | Giao diện phải cập nhật vị trí của công việc ngay lập tức sau khi được thả vào một cột mới (cập nhật lạc quan). | Functional |
| TR-DB-F-02.3 | A "toast" notification must appear confirming the status change. | Một thông báo "toast" phải xuất hiện để xác nhận việc thay đổi trạng thái. | Functional |
| **TR-DB-F-03** | **Filtering and Search Functionality** | **Chức năng Lọc và Tìm kiếm** | **Functional** |
| TR-DB-F-03.1 | The search bar must filter tasks by matching text in the task title or tags. | Thanh tìm kiếm phải lọc các công việc bằng cách khớp văn bản trong tiêu đề hoặc thẻ của công việc. | Functional |
| TR-DB-F-03.2 | The assignee filter must correctly display tasks assigned to the selected user, all users, or unassigned tasks. | Bộ lọc người được giao phải hiển thị chính xác các công việc được giao cho người dùng đã chọn, tất cả người dùng, hoặc các công việc chưa được giao. | Functional |
| TR-DB-F-03.3 | The team filter must correctly display tasks belonging to the selected team. | Bộ lọc đội phải hiển thị chính xác các công việc thuộc về đội đã chọn. | Functional |
| TR-DB-F-03.4 | Applying multiple filters simultaneously must return only the tasks that match all criteria. | Áp dụng nhiều bộ lọc cùng lúc phải trả về chỉ những công việc thỏa mãn tất cả các tiêu chí. | Functional |
| TR-DB-F-03.5 | The "Clear Filters" button must reset the search, assignee, and team filters to their default state. | Nút "Xóa bộ lọc" phải đặt lại các bộ lọc tìm kiếm, người được giao, và đội về trạng thái mặc định. | Functional |
| **TR-DB-F-04** | **View Modes Work Correctly** | **Các Chế độ xem hoạt động đúng** | **Functional** |
| TR-DB-F-04.1 | Switching to "Calendar View" must display tasks on a calendar based on their due dates. | Chuyển sang "Chế độ xem Lịch" phải hiển thị các công việc trên lịch dựa vào ngày hết hạn. | Functional |
| TR-DB-F-04.2 | Switching to "Timeline View" must display tasks in a chronological timeline. | Chuyển sang "Chế độ xem Dòng thời gian" phải hiển thị các công việc theo một dòng thời gian. | Functional |
| TR-DB-F-04.3 | Clicking a task in Calendar or Timeline view must open the task details sheet. | Nhấp vào một công việc trong chế độ xem Lịch hoặc Dòng thời gian phải mở ra trang chi tiết công việc. | Functional |
| **TR-DB-L-05** | **UI is Clear and Professional** | **Giao diện rõ ràng và chuyên nghiệp** | **Look and Feel** |
| TR-DB-L-05.1 | Task cards must have a clear and readable layout, even with long titles. | Thẻ công việc phải có bố cục rõ ràng, dễ đọc, ngay cả với tiêu đề dài. | Look and Feel |
| TR-DB-L-05.2 | The drag-and-drop action should have a clear visual indicator (e.g., a shadow or highlight). | Hành động kéo-thả nên có một chỉ báo trực quan rõ ràng (ví dụ: bóng đổ hoặc highlight). | Look and Feel |
| TR-DB-L-05.3 | The page must be responsive and display correctly on mobile, tablet, and desktop screens. | Trang phải có tính đáp ứng (responsive) và hiển thị chính xác trên màn hình di động, máy tính bảng và máy tính để bàn. | Look and Feel |
| TR-DB-L-05.4 | A loading skeleton should be displayed while tasks are being fetched to prevent a blank screen. | Một bộ khung sườn (skeleton) tải trang nên được hiển thị trong khi các công việc đang được lấy về để tránh màn hình trống. | Look and Feel |
| **TR-DB-B-06** | **System Handles Boundary Values** | **Hệ thống xử lý đúng các giá trị biên** | **Boundary** |
| TR-DB-B-06.1 | The board must handle a very large number of tasks (e.g., 100+) in a single column without performance degradation. | Bảng phải xử lý được một số lượng công việc rất lớn (ví dụ: 100+) trong một cột mà không làm giảm hiệu suất. | Boundary |
| TR-DB-B-06.2 | The board must display correctly when there are no tasks at all (empty state). | Bảng phải hiển thị chính xác khi không có công việc nào (trạng thái rỗng). | Boundary |
| TR-DB-B-06.3 | Filtering should work correctly with search strings that are very long or contain special characters. | Việc lọc phải hoạt động chính xác với các chuỗi tìm kiếm rất dài hoặc chứa các ký tự đặc biệt. | Boundary |
| **TR-DB-N-07** | **System Handles Negative Scenarios** | **Hệ thống xử lý tốt các tình huống không mong muốn** | **Negative** |
| TR-DB-N-07.1 | If fetching tasks fails due to a network error, a proper error message must be shown to the user. | Nếu việc lấy công việc thất bại do lỗi mạng, một thông báo lỗi phù hợp phải được hiển thị cho người dùng. | Negative |
| TR-DB-N-07.2 | If a user tries to drag a task while offline, the task should snap back to its original position and an error message should be shown. | Nếu người dùng cố gắng kéo một công việc khi không có mạng, công việc đó phải quay lại vị trí ban đầu và một thông báo lỗi nên được hiển thị. | Negative |
| TR-DB-N-07.3 | Filtering for a non-existent user or team should result in an empty list, not an error. | Lọc theo một người dùng hoặc đội không tồn tại sẽ trả về một danh sách trống, không phải là một lỗi. | Negative |
| TR-DB-N-07.4 | Opening task details for a task that was just deleted by another user should be handled gracefully (e.g., show a "task not found" message). | Mở chi tiết một công việc vừa bị người dùng khác xóa phải được xử lý một cách mượt mà (ví dụ: hiển thị thông báo "không tìm thấy công việc"). | Negative |
