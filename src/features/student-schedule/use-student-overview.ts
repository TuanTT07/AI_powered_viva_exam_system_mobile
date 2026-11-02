import { useCallback, useEffect, useState } from "react";
import type { Slot } from "../schedule/model";
import { isHistory, studentExams, type StudentExam } from "./student-model";
import { loadStudentAllSlots } from "./student-api";

export function useStudentOverview(
  initialSlots: Slot[] = [],
  studentId?: string,
  token?: string,
) {
  const [tab, setTab] = useState<"schedule" | "grades" | "profile">("schedule");
  const [filter, setFilter] = useState<"upcoming" | "history">("upcoming");
  const [selected, setSelected] = useState("");

  const [items, setItems] = useState<StudentExam[]>(() =>
    studentExams(initialSlots, studentId),
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (isPullToRefresh = false) => {
      if (!token || !studentId) return;
      if (isPullToRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const liveItems = await loadStudentAllSlots(token, studentId);
        setItems(liveItems);
      } catch (e) {
        setError((e as Error).message || "Không thể tải lịch thi cá nhân.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, studentId],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
    loading,
    refreshing,
    error,
    item: items.find((item) => item.slot.attemptId === selected),
    setFilter,
    setSelected,
    selectTab,
    refresh: () => loadData(true),
    retry: () => loadData(false),
  };
}
