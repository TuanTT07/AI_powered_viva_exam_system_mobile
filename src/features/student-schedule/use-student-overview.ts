import { useCallback, useState } from "react";
import type { Slot } from "../schedule/model";
import { isHistory, studentExams } from "./student-model";
export function useStudentOverview(slots: Slot[], studentId?: string) {
  const [tab, setTab] = useState<"schedule" | "grades" | "profile">("schedule");
  const [filter, setFilter] = useState<"upcoming" | "history">("upcoming");
  const [selected, setSelected] = useState("");
  // ponytail: no fabricated identity or records while authentication is disconnected.
  const items = studentExams(slots, studentId);
  const visible = items.filter((item) =>
    filter === "history" ? isHistory(item) : !isHistory(item),
  );
  const selectTab = useCallback((next: typeof tab) => {
    setSelected("");
    setTab(next);
  }, []);
  return {
    tab,
    filter,
    selected,
    visible,
    items,
    item: items.find((item) => item.slot.attemptId === selected),
    setFilter,
    setSelected,
    selectTab,
  };
}
