# Yêu cầu Kiểm thử (Test Requirements) - Chức năng Hiển thị Thông tin Cá nhân

Bảng này liệt kê các yêu cầu kiểm thử chi tiết cho chức năng hiển thị thông tin cá nhân của người dùng trên trang "Cài đặt".

| ID          | Requirement (English)                               | Yêu cầu (Tiếng Việt)                                               | Loại (Type)       |
|-------------|-----------------------------------------------------|--------------------------------------------------------------------|-------------------|
| **TR-F-01** | **User Profile Information is Displayed Correctly** | **Thông tin hồ sơ người dùng được hiển thị chính xác**              | **Functional**    |
| TR-F-01.1   | The user's full name must be shown accurately.      | Họ và tên của người dùng phải được hiển thị chính xác.             | Functional        |
| TR-F-01.2   | The user's email address must be shown accurately.  | Địa chỉ email của người dùng phải được hiển thị chính xác.         | Functional        |
| TR-F-01.3   | The user's phone number must be displayed if it exists. | Số điện thoại của người dùng phải được hiển thị nếu có.            | Functional        |
| TR-F-01.4   | The user's date of birth must be displayed correctly if it exists. | Ngày sinh của người dùng phải được hiển thị đúng định dạng nếu có. | Functional        |
| TR-F-01.5   | The user's current avatar must be displayed.        | Ảnh đại diện hiện tại của người dùng phải được hiển thị.          | Functional        |
| **TR-L-02** | **UI is Clear and Professional**                    | **Giao diện rõ ràng và chuyên nghiệp**                             | **Look and Feel** |
| TR-L-02.1   | Labels and input fields must be properly aligned.   | Các nhãn và trường nhập liệu phải được căn chỉnh thẳng hàng.       | Look and Feel     |
| TR-L-02.2   | The avatar must be displayed clearly, as a circle.  | Ảnh đại diện phải được hiển thị rõ nét và có dạng tròn.            | Look and Feel     |
| TR-L-02.3   | All text should be readable with sufficient contrast. | Toàn bộ văn bản phải dễ đọc và có độ tương phản đủ.              | Look and Feel     |
| **TR-B-03** | **System Correctly Handles Boundary Values**        | **Hệ thống xử lý đúng các giá trị biên hiển thị**                  | **Boundary**      |
| TR-B-03.1   | A very long name should be displayed without breaking the layout. | Một tên rất dài phải được hiển thị mà không làm vỡ bố cục (ví dụ: cắt ngắn). | Boundary          |
| TR-B-03.2   | A very long email should be displayed without breaking the layout. | Một email rất dài phải được hiển thị mà không làm vỡ bố cục. | Boundary          |
| TR-B-03.3   | A user with no phone number should not show the phone field. | Người dùng không có số điện thoại không nên thấy trường SĐT.   | Boundary          |
| TR-B-03.4   | A user with no date of birth should show a placeholder like "Select a date". | Người dùng không có ngày sinh nên hiển thị chữ giữ chỗ như "Chọn một ngày". | Boundary          |
| **TR-N-04** | **System Handles Unexpected Scenarios Gracefully**  | **Hệ thống xử lý tốt các tình huống không mong muốn**              | **Negative**      |
| TR-N-04.1   | If the avatar image URL is broken, a fallback initial should be shown. | Nếu URL ảnh đại diện bị hỏng, một ký tự thay thế (fallback) phải được hiển thị. | Negative          |
| TR-N-04.2   | If any profile data is `null` or `undefined`, the page must load without errors. | Nếu bất kỳ dữ liệu hồ sơ nào là `null` hoặc `undefined`, trang phải tải mà không có lỗi. | Negative          |
