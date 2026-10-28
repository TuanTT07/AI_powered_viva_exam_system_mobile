# UI states

Sinh viên có ba tab Lịch thi, Điểm, Hồ sơ. Mỗi tab có tiêu đề riêng, vùng nội dung cuộn độc lập và thanh điều hướng dưới ngoài vùng cuộn. Bộ lọc Sắp tới/Đã qua dùng trạng thái selected và vùng chạm 48dp. Điều hướng dùng icon nét mảnh + nhãn chữ.

Hiện trạng: chưa kết nối. Lịch và điểm có empty state rõ nguồn dữ liệu chưa kết nối. Hồ sơ không có tên/email/mã tự sinh; đổi mật khẩu disabled kèm lý do. Không có thao tác làm mới giả, lưu giả hoặc điểm AI được gắn nhãn điểm chính thức.

Style: bảng màu web AIVES (royal blue, slate, white), Plus Jakarta Sans đóng gói offline, bề mặt hai lớp, nút pill. Chuyển màn dùng opacity/translate với cubic-bezier; tôn trọng reduced motion. Khoảng cách mobile 20–24dp, không dùng whitespace cỡ landing page theo mặc định skill.

Shared loading/error components vẫn dùng cho nguồn dữ liệu tương lai; không có nút giả lập trạng thái. Chưa thể xác nhận loading/API error/permission/chi tiết có dữ liệu qua UI khi chưa tích hợp nguồn thật.
