import type { Slot, Exam } from "../schedule/model";
import { exams } from "../schedule/model";

export type StudentExam = {
  exam: Exam;
  slot: Slot;
  accessCode?: string | null;
  questions?: Array<{
    questionId: string;
    content: string;
    order?: number;
  }>;
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
