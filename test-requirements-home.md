# Yêu cầu Kiểm thử (Test Requirements) - Trang chủ (Home Page)

Bảng này liệt kê các yêu cầu kiểm thử chi tiết cho các chức năng hiện có trên Trang chủ.

| ID | Requirement (English) | Yêu cầu (Tiếng Việt) | Loại (Type) |
| :--- | :--- | :--- | :--- |
| **TR-HM-F-01** | **Personal Stats Display Correctly** | **Thống kê Cá nhân Hiển thị Chính xác** | **Functional** |
| TR-HM-F-01.1 | The "Total Tasks" card must show the correct count of all tasks assigned to the user. | Thẻ "Tổng Công việc" phải hiển thị đúng tổng số công việc được giao cho người dùng. | Functional |
| TR-HM-F-01.2 | The "Completed" card must show the correct count of tasks with the status 'Hoàn thành'. | Thẻ "Đã Hoàn thành" phải hiển thị đúng số lượng công việc có trạng thái 'Hoàn thành'. | Functional |
| TR-HM-F-01.3 | The "Completion Rate" card must calculate and display the correct percentage (Completed / Total). | Thẻ "Tỷ lệ Hoàn thành" phải tính toán và hiển thị đúng phần trăm (Đã hoàn thành / Tổng cộng). | Functional |
| TR-HM-F-01.4 | The progress bar under the completion rate must accurately reflect the percentage. | Thanh tiến trình dưới tỷ lệ hoàn thành phải phản ánh chính xác tỷ lệ phần trăm đó. | Functional |
| **TR-HM-F-02** | **AI Insight Functionality** | **Chức năng Gợi ý của AI** | **Functional** |
| TR-HM-F-02.1 | The "Insight for you" card must display a relevant message based on the user's task data. | Thẻ "Gợi ý cho bạn" phải hiển thị một thông điệp phù hợp dựa trên dữ liệu công việc của người dùng. | Functional |
| TR-HM-F-02.2 | If a user has many overdue tasks, the insight should prompt them to prioritize those. | Nếu người dùng có nhiều công việc quá hạn, gợi ý nên nhắc nhở họ ưu tiên những công việc đó. | Functional |
| TR-HM-F-02.3 | If a user has no tasks, a welcoming "no tasks yet" message must be shown. | Nếu người dùng không có công việc nào, một thông báo chào mừng "chưa có công việc" phải được hiển thị. | Functional |
| **TR-HM-F-03** | **Upcoming Tasks List Works Correctly** | **Danh sách Công việc Sắp tới Hoạt động Đúng** | **Functional** |
| TR-HM-F-03.1 | The list must only show tasks that are due within the next 7 days and are not completed. | Danh sách chỉ được hiển thị các công việc sẽ hết hạn trong vòng 7 ngày tới và chưa hoàn thành. | Functional |
| TR-HM-F-03.2 | Tasks in the list must be sorted by their due date, with the nearest due date first. | Các công việc trong danh sách phải được sắp xếp theo ngày hết hạn, với ngày gần nhất ở trên cùng. | Functional |
| TR-HM-F-03.3 | Clicking on an upcoming task should navigate the user to the project board. | Nhấp vào một công việc sắp tới sẽ điều hướng người dùng đến bảng dự án. | Functional |
| **TR-HM-L-04** | **UI is Clear and Professional** | **Giao diện rõ ràng và chuyên nghiệp** | **Look and Feel** |
| TR-HM-L-04.1 | The activity chart must render correctly and be easy to read. | Biểu đồ hoạt động phải được hiển thị chính xác và dễ đọc. | Look and Feel |
| TR-HM-L-04.2 | If there is no activity data for the chart, a clear "No activity" message must be displayed. | Nếu không có dữ liệu hoạt động cho biểu đồ, một thông báo "Chưa có hoạt động" rõ ràng phải được hiển thị. | Look and Feel |
| TR-HM-L-04.3 | A loading skeleton should be shown while dashboard data is being fetched. | Một bộ khung sườn (skeleton) tải trang nên được hiển thị trong khi dữ liệu bảng điều khiển đang được lấy về. | Look and Feel |
| **TR-HM-B-05** | **System Handles Boundary Values** | **Hệ thống xử lý đúng các giá trị biên** | **Boundary** |
| TR-HM-B-05.1 | All components must display correctly when a user has zero tasks. | Tất cả các thành phần phải hiển thị chính xác khi người dùng có 0 công việc. | Boundary |
| TR-HM-B-05.2 | The completion rate must correctly show 0% for zero tasks and 100% when all tasks are done. | Tỷ lệ hoàn thành phải hiển thị đúng 0% khi có 0 công việc và 100% khi tất cả công việc đều hoàn thành. | Boundary |
| **TR-HM-N-06** | **System Handles Negative Scenarios** | **Hệ thống xử lý tốt các tình huống không mong muốn** | **Negative** |
| TR-HM-N-06.1 | If fetching task data fails, the page should handle the error gracefully without crashing. | Nếu việc lấy dữ liệu công việc thất bại, trang phải xử lý lỗi một cách mượt mà mà không bị sập. | Negative |
| TR-HM-N-06.2 | The page must handle tasks that have missing or invalid date fields without errors. | Trang phải xử lý các công việc có trường ngày bị thiếu hoặc không hợp lệ mà không gây ra lỗi. | Negative |
