import assert from "node:assert/strict";
import {
  DEMO_CODE,
  filterSlots,
  lookupSlot,
  reschedule,
  seedSlots,
  time,
} from "../src/features/schedule/model.ts";
const slots = seedSlots();
assert.equal(lookupSlot(slots, ` ${DEMO_CODE} `)?.studentCode, "SE190163");
assert.equal(lookupSlot(slots, "invalid"), undefined);
assert.equal(filterSlots(slots, DEMO_CODE, "duc anh", "").length, 1);
assert.equal(filterSlots(slots, DEMO_CODE, "", "CANCELLED").length, 1);
assert.throws(
  () => reschedule(slots, "0-0", "2026-11-02", "08:25", "08:45"),
  /trùng/,
);
assert.throws(
  () => reschedule(slots, "0-0", "2026-02-30", "11:00", "11:20"),
  /Ngày/,
);
assert.throws(
  () => reschedule(slots, "0-0", "2026-11-02", "12:00", "11:00"),
  /kết thúc/,
);
assert.throws(
  () => reschedule(slots, "0-4", "2026-11-02", "11:00", "11:20"),
  /Chỉ đổi/,
);
const next = reschedule(slots, "0-0", "2026-11-02", "11:00", "11:20");
assert.equal(time(next[0].scheduledStartTime), "11:00");
assert.equal(time(slots[0].scheduledStartTime), "08:00");
assert.equal(time(seedSlots()[0].scheduledStartTime), "08:00");
assert.equal(filterSlots(next, DEMO_CODE, "", "", "2026-11-03").length, 0);
console.log("12 schedule checks passed");
