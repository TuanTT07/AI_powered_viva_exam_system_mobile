# Tích hợp API Lịch thi & Xem điểm thi (Sinh viên & Giảng viên)

## Mục tiêu
Triển khai kết nối API thực tế từ backend theo phạm vi người dùng yêu cầu:
1. **Sinh viên**: Nâng cấp kết nối sang API chuyên biệt `GET /api/v1/student/exams` (lấy lịch thi cá nhân trực tiếp theo token) và `GET /api/v1/student/exams/{examId}/my-slot` (chi tiết ca thi, access code, câu hỏi, cấu hình phòng thi).
2. **Giảng viên**: Tích hợp tính năng xem kết quả & điểm thi (read-only) theo môn học phụ trách (`GET /api/courses/{courseId}/evaluations` và `GET /api/question-attempts/{id}/evaluation`), xem điểm AI gợi ý, điểm cuối, tiêu chí rubric và nhận xét đánh giá.

## Các Endpoints tích hợp
- `GET /api/v1/student/exams?page=0&size=50`: Lịch thi cá nhân của sinh viên đang đăng nhập.
- `GET /api/v1/student/exams/{examId}/my-slot`: Chi tiết ca thi cá nhân (mã truy cập, câu hỏi, thời gian).
- `GET /api/lecturers/{lecturerId}/courses`: Danh sách môn học giảng viên phụ trách.
- `GET /api/courses/{courseId}/evaluations?status=PENDING_REVIEW|GRADED&page=0&size=50`: Danh sách bài thi và điểm theo môn học.
- `GET /api/question-attempts/{questionAttemptId}/evaluation`: Chi tiết tiêu chí và nhận xét điểm.
- `PATCH /api/v1/exams/{id}/status`: Cập nhật trạng thái kỳ thi (DRAFT, PUBLISHED, IN_PROGRESS, COMPLETED).

## Kế hoạch thực hiện & Kết quả
1. **Cập nhật `scripts/preview.mjs`**:
   - Bổ sung allowlist proxy cho `/api/courses/**` và `/api/question-attempts/**`.
2. **Nâng cấp `src/features/student-schedule/student-api.ts`**:
   - Bổ sung `getStudentExams` kết nối trực tiếp `GET /api/v1/student/exams`.
   - Cập nhật `getStudentMySlot` và `loadStudentAllSlots` fetch trực tiếp 1 request từ endpoint cá nhân thay vì scan toàn bộ kỳ thi, có fallback an toàn.
3. **Thêm API tra cứu điểm cho Giảng viên trong `src/features/lecturer-schedule/lecturer-api.ts`**:
   - Định nghĩa DTOs: `CourseEvaluationDto`, `EvaluationDetailDto`, `CriterionScoreDto`.
   - Viết các hàm `getCourseEvaluations(token, courseId, options)` và `getQuestionEvaluationDetail(token, questionAttemptId)`.
   - Viết hàm `updateExamStatus(token, examId, status)`.
4. **Cập nhật `use-lecturer-overview.ts`**:
   - Bổ sung tab `grades` ("Điểm thi") và quản lý state cho môn học phụ trách, bộ lọc trạng thái đánh giá ("Tất cả", "Chờ duyệt", "Đã chốt"), danh sách evaluations và chi tiết evaluation được chọn.
   - Thêm handler `updateStatus` cập nhật trạng thái kỳ thi.
5. **Cập nhật `LecturerScheduleScreen.tsx`**:
   - Thêm tab "Điểm thi" vào thanh điều hướng dưới (icon `score`).
   - Hiển thị danh sách môn học chọn lọc, danh sách câu hỏi đã được đánh giá kèm điểm AI gợi ý / điểm chính thức.
   - Xem chi tiết tiêu chí chấm (rubric criteria scores) và nhận xét tổng thể (overall feedback).
   - Thêm nút cập nhật trạng thái kỳ thi (`IN_PROGRESS` / `COMPLETED`) cho giảng viên.
6. **Kiểm tra & Biên dịch**:
   - `npm run typecheck`: Passed (0 errors).
   - `npm run build`: Passed (Expo web export thành công).
   - Không chạy unit tests hay ui-tests theo đúng quy định.
