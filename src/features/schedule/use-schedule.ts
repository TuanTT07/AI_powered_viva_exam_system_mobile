import type { Slot } from "./model";
const slots: Slot[] = [];
export function useSchedule() {
  return {
    slots,
    changeSlot() {
      throw new Error("Chưa kết nối máy chủ.");
    },
  };
}
