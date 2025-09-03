# Yêu cầu Kiểm thử (Test Requirements) - Hướng dẫn Sử dụng (Tour Guide)

Bảng này liệt kê các yêu cầu kiểm thử chi tiết cho chức năng Hướng dẫn Sử dụng.

| ID | Requirement (English) | Yêu cầu (Tiếng Việt) | Loại (Type) |
| :--- | :--- | :--- | :--- |
| **TR-TG-F-01** | **Tour Modal Functionality** | **Chức năng của Modal Hướng dẫn** | **Functional** |
| TR-TG-F-01.1 | Clicking the "Guide" button in the sidebar must open the tour modal. | Nhấp vào nút "Hướng dẫn" trên thanh điều hướng phải mở ra modal hướng dẫn. | Functional |
| TR-TG-F-01.2 | The "Next" button must navigate to the next step in the carousel. | Nút "Tiếp theo" phải chuyển đến bước tiếp theo trong carousel. | Functional |
| TR-TG-F-01.3 | The "Previous" button must navigate to the previous step in the carousel. | Nút "Trước" phải chuyển đến bước trước đó trong carousel. | Functional |
| TR-TG-F-01.4 | On the last step, the "Next" button must change to a "Finish" button. | Ở bước cuối cùng, nút "Tiếp theo" phải đổi thành nút "Hoàn tất". | Functional |
| TR-TG-F-01.5 | Clicking the "Finish" button or the 'X' icon must close the modal. | Nhấp vào nút "Hoàn tất" hoặc biểu tượng 'X' phải đóng modal. | Functional |
| TR-TG-F-01.6 | The step counter ("Step X of Y") must update correctly with each navigation. | Bộ đếm bước ("Bước X trên Y") phải cập nhật chính xác sau mỗi lần chuyển bước. | Functional |
| **TR-TG-L-02** | **UI is Clear and Responsive** | **Giao diện rõ ràng và có tính đáp ứng** | **Look and Feel** |
| TR-TG-L-02.1 | The modal must be centered on the screen on both desktop and mobile devices. | Modal phải được căn giữa màn hình trên cả thiết bị máy tính và di động. | Look and Feel |
| TR-TG-L-02.2 | The content within the modal (title, description) must be readable and well-formatted. | Nội dung bên trong modal (tiêu đề, mô tả) phải dễ đọc và được định dạng tốt. | Look and Feel |
| TR-TG-L-02.3 | The layout must adapt gracefully to smaller screen sizes without overflowing or breaking. | Bố cục phải thích ứng mượt mà với các kích thước màn hình nhỏ hơn mà không bị tràn hoặc vỡ. | Look and Feel |
| **TR-TG-B-03** | **System Handles Boundary Values** | **Hệ thống xử lý đúng các giá trị biên** | **Boundary** |
| TR-TG-B-03.1 | The "Previous" button must be disabled on the first step. | Nút "Trước" phải bị vô hiệu hóa ở bước đầu tiên. | Boundary |
| TR-TG-B-03.2 | The "Next" button must be disabled on the last step (when it is not the "Finish" button). | Nút "Tiếp theo" phải bị vô hiệu hóa ở bước cuối cùng (khi nó chưa chuyển thành nút "Hoàn tất"). | Boundary |
| **TR-TG-N-04** | **System Handles Negative Scenarios** | **Hệ thống xử lý tốt các tình huống không mong muốn** | **Negative** |
| TR-TG-N-04.1 | Opening and closing the tour multiple times should not cause any UI glitches or errors. | Mở và đóng hướng dẫn nhiều lần không được gây ra bất kỳ lỗi giao diện nào. | Negative |
| TR-TG-N-04.2 | If the tour is open and the window is resized, the modal should remain centered and responsive. | Nếu hướng dẫn đang mở và cửa sổ được thay đổi kích thước, modal phải giữ nguyên vị trí trung tâm và tính đáp ứng. | Negative |
