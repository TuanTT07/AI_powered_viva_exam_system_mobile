import type { Slot, Exam } from "../schedule/model";
import { exams } from "../schedule/model";

export type LecturerSlotItem = {
  slot: Slot;
  exam?: Exam;
};

export function lecturerSlots(
  slots: Slot[],
  examsList: Exam[] = [],
): LecturerSlotItem[] {
  return slots
    .map((slot) => ({
      slot,
      exam:
        examsList.find((e) => e.id === slot.examId) ??
        exams.find((e) => e.id === slot.examId),
    }))
    .sort(
      (a, b) =>
        Date.parse(a.slot.scheduledStartTime) -
        Date.parse(b.slot.scheduledStartTime),
    );
}

export function isSlotHistory(slot: Slot): boolean {
  return ["COMPLETED", "ABSENT", "CANCELLED"].includes(slot.status);
}
