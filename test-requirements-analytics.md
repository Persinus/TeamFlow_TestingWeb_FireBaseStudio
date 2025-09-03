# Yêu cầu Kiểm thử (Test Requirements) - Trang Báo cáo & Phân tích

Bảng này liệt kê các yêu cầu kiểm thử chi tiết cho chức năng của Trang Báo cáo & Phân tích.

| ID | Requirement (English) | Yêu cầu (Tiếng Việt) | Loại (Type) |
| :--- | :--- | :--- | :--- |
| **TR-AN-F-01** | **Data Filtering Works Correctly** | **Lọc dữ liệu hoạt động chính xác** | **Functional** |
| TR-AN-F-01.1 | The team filter dropdown must list all teams the current user is a member of. | Hộp thoại lọc theo đội phải liệt kê tất cả các đội mà người dùng hiện tại là thành viên. | Functional |
| TR-AN-F-01.2 | Selecting a team must filter the performance table and charts to show data only for that team. | Chọn một đội phải lọc bảng hiệu suất và các biểu đồ để chỉ hiển thị dữ liệu cho đội đó. | Functional |
| TR-AN-F-01.3 | Selecting "All teams" must aggregate data from all teams the user is in. | Chọn "Tất cả các đội" phải tổng hợp dữ liệu từ tất cả các đội mà người dùng tham gia. | Functional |
| **TR-AN-F-02** | **CSV Export Functionality** | **Chức năng Xuất ra CSV** | **Functional** |
| TR-AN-F-02.1 | Clicking the "Export to CSV" button must download a file named `analytics_export_YYYY-MM-DD.csv`. | Nhấp vào nút "Xuất ra CSV" phải tải về một tệp có tên `analytics_export_YYYY-MM-DD.csv`. | Functional |
| TR-AN-F-02.2 | The downloaded CSV file must contain the correct headers: "Thành viên", "Tổng cộng", "Tồn đọng", etc. | Tệp CSV được tải về phải chứa các tiêu đề cột chính xác: "Thành viên", "Tổng cộng", "Tồn đọng", v.v. | Functional |
| TR-AN-F-02.3 | The data in the CSV file must accurately match the data displayed in the performance table at the time of export. | Dữ liệu trong tệp CSV phải khớp chính xác với dữ liệu được hiển thị trong bảng hiệu suất tại thời điểm xuất. | Functional |
| TR-AN-F-02.4 | The export button should be disabled if there is no analytics data to export. | Nút xuất phải bị vô hiệu hóa nếu không có dữ liệu phân tích nào để xuất. | Functional |
| **TR-AN-F-03** | **Data is Displayed Correctly** | **Dữ liệu được hiển thị chính xác** | **Functional** |
| TR-AN-F-03.1 | The performance table must accurately show the total tasks and the count for each status for every member. | Bảng hiệu suất phải hiển thị chính xác tổng số công việc và số lượng cho mỗi trạng thái của từng thành viên. | Functional |
| TR-AN-F-03.2 | The progress bar for each member must correctly calculate and display the completion percentage. | Thanh tiến độ cho mỗi thành viên phải tính toán và hiển thị chính xác phần trăm hoàn thành. | Functional |
| TR-AN-F-03.3 | The "Task Type Distribution" pie chart must correctly show the proportion of tasks by type (Feature, Bug, Task). | Biểu đồ tròn "Phân loại Công việc" phải hiển thị chính xác tỷ lệ các loại công việc (Tính năng, Lỗi, Công việc). | Functional |
| **TR-AN-L-04** | **UI is Clear and Professional** | **Giao diện rõ ràng và chuyên nghiệp** | **Look and Feel** |
| TR-AN-L-04.1 | A loading skeleton should be displayed while analytics data is being fetched. | Một bộ khung sườn (skeleton) tải trang nên được hiển thị trong khi dữ liệu phân tích đang được lấy về. | Look and Feel |
| TR-AN-L-04.2 | If there is no data to display (e.g., a new team with no tasks), a clear "No data" message must be shown. | Nếu không có dữ liệu để hiển thị (ví dụ: một đội mới không có công việc), một thông báo "Không có dữ liệu" rõ ràng phải được hiển thị. | Look and Feel |
| TR-AN-L-04.3 | The page layout must be responsive and adapt correctly to desktop, tablet, and mobile screen sizes. | Bố cục trang phải có tính đáp ứng và thích ứng chính xác với các kích thước màn hình máy tính, máy tính bảng và di động. | Look and Feel |
| **TR-AN-B-05** | **System Handles Boundary Values** | **Hệ thống xử lý đúng các giá trị biên** | **Boundary** |
| TR-AN-B-05.1 | The page must handle a user being in a very large number of teams (e.g., 50+) without crashing the filter. | Trang phải xử lý được trường hợp người dùng ở trong một số lượng đội rất lớn (ví dụ: 50+) mà không làm hỏng bộ lọc. | Boundary |
| TR-AN-B-05.2 | The charts must display correctly when a member has zero tasks. | Các biểu đồ phải hiển thị chính xác khi một thành viên có số công việc bằng không. | Boundary |
| TR-AN-B-05.3 | The page should function correctly for a team with many members (e.g., 100+). | Trang phải hoạt động chính xác đối với một đội có nhiều thành viên (ví dụ: 100+). | Boundary |
| **TR-AN-N-06** | **System Handles Negative Scenarios** | **Hệ thống xử lý tốt các tình huống không mong muốn** | **Negative** |
| TR-AN-N-06.1 | If fetching analytics data fails, a proper error message must be shown to the user. | Nếu việc lấy dữ liệu phân tích thất bại, một thông báo lỗi phù hợp phải được hiển thị cho người dùng. | Negative |
| TR-AN-N-06.2 | The pie chart should not render if there are no tasks with types assigned. | Biểu đồ tròn không nên được hiển thị nếu không có công việc nào được gán loại. | Negative |
| TR-AN-N-06.3 | Filtering by a team that has just been deleted by another user should be handled gracefully. | Việc lọc theo một đội vừa bị người dùng khác xóa phải được xử lý một cách mượt mà. | Negative |
