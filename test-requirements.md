# Yêu cầu Kiểm thử (Test Requirements) - Chức năng Thông tin Cá nhân

Bảng này liệt kê các yêu cầu kiểm thử chi tiết cho chức năng quản lý thông tin cá nhân của người dùng trên trang "Cài đặt".

| ID | Requirement (English) | Yêu cầu (Tiếng Việt) | Loại (Type) |
|---|---|---|---|
| **TR-F-01** | **User Can Successfully Update Profile** | **Người dùng có thể cập nhật hồ sơ thành công** | **Functional** |
| TR-F-01.1 | After changing Name, Phone, DoB and saving, the new data must be persisted correctly. | Sau khi thay đổi Họ tên, SĐT, Ngày sinh và lưu, dữ liệu mới phải được lưu chính xác. | Functional |
| TR-F-01.2 | After a successful update, the new information (e.g., name) should be reflected globally. | Sau khi cập nhật, thông tin mới (ví dụ: tên) phải được phản ánh trên toàn ứng dụng. | Functional |
| TR-F-01.3 | A "Profile updated" success toast message must appear after saving. | Một thông báo "Hồ sơ đã được cập nhật" phải xuất hiện sau khi lưu thành công. | Functional |
| TR-F-01.4 | The user's email field must be read-only and cannot be edited. | Trường email của người dùng phải ở chế độ chỉ đọc và không thể chỉnh sửa. | Functional |
| **TR-F-02** | **User Can Change Avatar** | **Người dùng có thể thay đổi ảnh đại diện** | **Functional** |
| TR-F-02.1 | Clicking "Change Avatar" must open a modal with a list of predefined avatars. | Nhấn "Đổi ảnh" phải mở ra một modal với danh sách các ảnh đại diện có sẵn. | Functional |
| TR-F-02.2 | Selecting a new avatar in the modal must immediately update the avatar on the page and save. | Chọn một ảnh đại diện mới trong modal phải ngay lập tức cập nhật và lưu thay đổi. | Functional |
| **TR-L-03** | **UI is Clear and Professional** | **Giao diện rõ ràng và chuyên nghiệp** | **Look and Feel** |
| TR-L-03.1 | Labels and input fields must be properly aligned. | Các nhãn và trường nhập liệu phải được căn chỉnh thẳng hàng. | Look and Feel |
| TR-L-03.2 | The avatar must be displayed clearly, as a circle, and with appropriate dimensions. | Ảnh đại diện phải được hiển thị rõ nét, dạng tròn và có kích thước phù hợp. | Look
and Feel |
| TR-L-03.3 | The "Update profile" button should show a loading spinner during the update process. | Nút "Cập nhật hồ sơ" phải có spinner tải khi đang xử lý để thông báo cho người dùng. | Look and Feel |
| **TR-B-04** | **System Correctly Handles Boundary Values**| **Hệ thống xử lý đúng các giá trị biên** | **Boundary** |
| TR-B-04.1 | Test entering a very long name (e.g., 100 chars) and a very short name (1 char). | Kiểm tra việc nhập một tên rất dài (100 ký tự) hoặc rất ngắn (1 ký tự). | Boundary |
| TR-B-04.2 | Test entering a phone number with special characters and international formats. | Kiểm tra việc nhập số điện thoại có ký tự đặc biệt và định dạng quốc tế. | Boundary |
| TR-B-04.3 | Test selecting a date of birth in the future or in the distant past (e.g., year 1900). | Kiểm tra việc chọn một ngày sinh ở tương lai hoặc một ngày trong quá khứ xa. | Boundary |
| TR-B-04.4 | Clearing optional fields (Phone, DoB) and saving must be accepted by the system. | Xóa thông tin các trường tùy chọn (SĐT, Ngày sinh) và lưu phải được hệ thống chấp nhận. | Boundary |
| **TR-N-05** | **System Handles Unexpected Scenarios Gracefully** | **Hệ thống xử lý tốt các tình huống không mong muốn** | **Negative** |
| TR-N-05.1 | Attempting to save with a blank required field (Name) should be prevented. | Thử lưu khi trường bắt buộc (Họ tên) bị bỏ trống phải bị ngăn chặn. | Negative |
| TR-N-05.2 | Clicking "Update profile" with no network connection should show a clear error message. | Nhấn "Cập nhật hồ sơ" khi không có mạng phải hiển thị một thông báo lỗi rõ ràng. | Negative |
| TR-N-05.3 | Closing the avatar selection modal without making a choice should not change the avatar. | Đóng modal chọn ảnh mà không chọn gì không được làm thay đổi ảnh đại diện hiện tại. | Negative |
