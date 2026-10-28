import type { Slot, Exam } from "../schedule/model.ts";
import { exams } from "../schedule/model.ts";
export type StudentExam = {
  exam: Exam;
  slot: Slot;
  released?: {
    score: number;
    comment: string;
    answers: { question: string; answer: string }[];
  };
};
export function studentExams(slots: Slot[], studentId?: string): StudentExam[] {
  if (!studentId) return [];
  return slots
    .filter((s) => s.studentId === studentId)
    .flatMap((slot) => {
      const exam = exams.find((e) => e.id === slot.examId);
      return exam ? [{ exam, slot }] : [];
    })
    .sort(
      (a, b) =>
        Date.parse(a.slot.scheduledStartTime) -
        Date.parse(b.slot.scheduledStartTime),
    );
}
export function isHistory(item: StudentExam) {
  return ["COMPLETED", "ABSENT", "CANCELLED"].includes(item.slot.status);
}
