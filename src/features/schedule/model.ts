export type SlotStatus =
  "SCHEDULED" | "READY" | "IN_PROGRESS" | "COMPLETED" | "ABSENT" | "CANCELLED";
export type Slot = {
  attemptId: string;
  examId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  slotNumber: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: SlotStatus;
};
export type Exam = {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  startTime: string;
  status: string;
};
export type Scenario = "ready" | "loading" | "empty" | "error";
export const labels: Record<SlotStatus, string> = {
  SCHEDULED: "Đã xếp lịch",
  READY: "Sẵn sàng",
  IN_PROGRESS: "Đang thi",
  COMPLETED: "Hoàn tất",
  ABSENT: "Vắng mặt",
  CANCELLED: "Đã hủy",
};
export const DEMO_CODE = "11111111-1111-4111-8111-111111111111";
export const exams: Exam[] = [
  {
    id: DEMO_CODE,
    title: "Vấn đáp Lập trình Java",
    courseCode: "INT2204",
    courseName: "Lập trình Java",
    startTime: "2026-11-02T08:00:00+07:00",
    status: "Đã công bố",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Vấn đáp Cơ sở dữ liệu",
    courseCode: "INT2210",
    courseName: "Cơ sở dữ liệu",
    startTime: "2026-11-04T13:30:00+07:00",
    status: "Đã công bố",
  },
];
export function seedSlots(): Slot[] {
  return exams.flatMap((exam, e) =>
    [
      "Nguyễn Đức Anh",
      "Trần Minh Hà",
      "Lê Hoàng Nam",
      "Phạm Ngọc Linh",
      "Vũ Gia Huy",
      "Đỗ Thu Trang",
    ].map((name, i) => {
      const start = Date.parse(exam.startTime) + i * 25 * 60000;
      return {
        attemptId: `${e}-${i}`,
        examId: exam.id,
        studentId: `demo-student-${i}`,
        studentName: name,
        studentCode: `SE190${163 + i}`,
        slotNumber: i + 1,
        scheduledStartTime: new Date(start).toISOString(),
        scheduledEndTime: new Date(start + 20 * 60000).toISOString(),
        status: i === 4 ? "CANCELLED" : "SCHEDULED",
      };
    }),
  );
}
export const time = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
export const day = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
export const dateKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
export function filterSlots(
  slots: Slot[],
  examId: string,
  query: string,
  status: string,
  date = "",
) {
  return slots
    .filter(
      (s) =>
        s.examId === examId &&
        (!status || s.status === status) &&
        (!date || dateKey(s.scheduledStartTime) === date) &&
        fold(`${s.studentName} ${s.studentCode}`).includes(fold(query.trim())),
    )
    .sort(
      (a, b) =>
        Date.parse(a.scheduledStartTime) - Date.parse(b.scheduledStartTime),
    );
}
export function lookupSlot(slots: Slot[], code: string) {
  return slots.find(
    (s) =>
      s.examId === code.trim().toLowerCase() &&
      s.studentId === "demo-student-0",
  );
}
export function reschedule(
  slots: Slot[],
  id: string,
  date: string,
  start: string,
  end: string,
): Slot[] {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(start) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)
  )
    throw new Error("Nhập ngày YYYY-MM-DD và giờ HH:mm hợp lệ.");
  const from = `${date}T${start}:00+07:00`,
    to = `${date}T${end}:00+07:00`,
    slot = slots.find((s) => s.attemptId === id);
  if (!slot || slot.status !== "SCHEDULED")
    throw new Error("Chỉ đổi ca chưa bắt đầu và đã xếp lịch.");
  if (
    !Number.isFinite(Date.parse(from)) ||
    dateKey(from) !== date ||
    Date.parse(to) <= Date.parse(from)
  )
    throw new Error(
      "Ngày không hợp lệ hoặc giờ kết thúc phải sau giờ bắt đầu.",
    );
  if (
    slots.some(
      (s) =>
        s.attemptId !== id &&
        s.examId === slot.examId &&
        s.status !== "CANCELLED" &&
        Date.parse(from) < Date.parse(s.scheduledEndTime) &&
        Date.parse(to) > Date.parse(s.scheduledStartTime),
    )
  )
    throw new Error("Khung giờ này trùng ca khác. Vui lòng chọn giờ khác.");
  return slots.map((s) =>
    s.attemptId === id
      ? { ...s, scheduledStartTime: from, scheduledEndTime: to }
      : s,
  );
}
