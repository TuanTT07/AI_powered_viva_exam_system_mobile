import { useState } from "react";
import { reschedule, seedSlots } from "./model";
// ponytail: in-memory data for the UI demo; replace this hook's source when API integration is approved.
export function useDemoSchedule() {
  const [slots, setSlots] = useState(seedSlots);
  return {
    slots,
    changeSlot(id: string, date: string, start: string, end: string) {
      const next = reschedule(slots, id, date, start, end);
      setSlots(next);
    },
  };
}
