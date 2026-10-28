import assert from "node:assert/strict";
import {
  exams,
  filterSlots,
  reschedule,
  time,
} from "../src/features/schedule/model.ts";
import {
  studentExams,
  isHistory,
} from "../src/features/student-schedule/student-model.ts";
assert.deepEqual(exams, []);
assert.deepEqual(studentExams([]), []);
assert.deepEqual(studentExams([], "signed-in-user"), []);
assert.deepEqual(filterSlots([], "exam", "", ""), []);
// Synthetic records belong to the test only, never the application bundle.
const slot = {
  attemptId: "a",
  examId: "e",
  studentId: "s",
  studentCode: "S1",
  studentName: "Test",
  slotNumber: 1,
  scheduledStartTime: "2030-01-01T08:00:00+07:00",
  scheduledEndTime: "2030-01-01T08:20:00+07:00",
  status: "SCHEDULED",
};
const slots = [
  slot,
  {
    ...slot,
    attemptId: "b",
    studentId: "t",
    scheduledStartTime: "2030-01-01T08:30:00+07:00",
    scheduledEndTime: "2030-01-01T08:50:00+07:00",
  },
];
assert.deepEqual(studentExams(slots), []);
assert.throws(
  () => reschedule(slots, "a", "2030-01-01", "08:30", "08:50"),
  /trùng/,
);
assert.throws(
  () => reschedule(slots, "a", "2030-02-30", "09:00", "09:20"),
  /Ngày/,
);
assert.throws(
  () => reschedule(slots, "a", "2030-01-01", "09:20", "09:00"),
  /kết thúc/,
);
assert.equal(
  time(
    reschedule(slots, "a", "2030-01-01", "09:00", "09:20")[0]
      .scheduledStartTime,
  ),
  "09:00",
);
assert.equal(time(slot.scheduledStartTime), "08:00");
assert.equal(isHistory({ slot: { ...slot, status: "COMPLETED" } }), true);
assert.equal(isHistory({ slot }), false);
const { useSchedule } = await import('../src/features/schedule/use-schedule.ts');
assert.deepEqual(useSchedule().slots, []);
assert.throws(() => useSchedule().changeSlot(), /Chưa kết nối/);
console.log("14 data-boundary and schedule checks passed");
