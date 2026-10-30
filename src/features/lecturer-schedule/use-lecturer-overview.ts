import { useCallback, useEffect, useState } from "react";
import type { Exam, Slot } from "../schedule/model";
import { isSlotHistory, lecturerSlots } from "./lecturer-model";
import {
  getExamSchedules,
  getLecturerExams,
  markCandidateAbsent,
  resetCandidateAttempt,
} from "./lecturer-api";

export function useLecturerOverview(initialSlots: Slot[] = [], token?: string) {
  const [tab, setTab] = useState<"schedule" | "roster" | "profile">("schedule");
  const [filter, setFilter] = useState<"upcoming" | "history">("upcoming");
  const [selected, setSelected] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [exams, setExams] = useState<Exam[]>([]);
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = useCallback(
    async (isPullToRefresh = false) => {
      if (!token) return;
      if (isPullToRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const fetchedExams = await getLecturerExams(token);
        setExams(fetchedExams);

        if (fetchedExams.length === 0) {
          setSlots([]);
          return;
        }

        const scheduleResults = await Promise.allSettled(
          fetchedExams.map((e) => getExamSchedules(token, e.id)),
        );

        const allSlots: Slot[] = [];
        for (const res of scheduleResults) {
          if (res.status === "fulfilled") {
            allSlots.push(...res.value);
          }
        }
        setSlots(allSlots);
      } catch (e) {
        setError((e as Error).message || "Không thể tải dữ liệu ca thi.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const items = lecturerSlots(slots, exams);
  const visible = items.filter((item) =>
    filter === "history" ? isSlotHistory(item.slot) : !isSlotHistory(item.slot),
  );

  const query = searchQuery.trim().toLowerCase();
  const roster = items.filter(
    (item) =>
      !query ||
      item.slot.studentName.toLowerCase().includes(query) ||
      item.slot.studentCode.toLowerCase().includes(query),
  );

  const selectTab = useCallback((next: typeof tab) => {
    setSelected("");
    setActionFeedback(null);
    setActionError(null);
    setTab(next);
  }, []);

  const handleMarkAbsent = useCallback(
    async (examId: string, attemptId: string) => {
      if (!token) return;
      setActionLoading(true);
      setActionFeedback(null);
      setActionError(null);
      try {
        const updated = await markCandidateAbsent(token, examId, attemptId);
        setSlots((prev) =>
          prev.map((s) => (s.attemptId === attemptId ? updated : s)),
        );
        setActionFeedback("Đã ghi nhận vắng mặt cho thí sinh.");
      } catch (e) {
        setActionError((e as Error).message || "Không thể ghi nhận vắng mặt.");
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  const handleResetAttempt = useCallback(
    async (examId: string, attemptId: string) => {
      if (!token) return;
      setActionLoading(true);
      setActionFeedback(null);
      setActionError(null);
      try {
        const updated = await resetCandidateAttempt(token, examId, attemptId);
        setSlots((prev) =>
          prev.map((s) => (s.attemptId === attemptId ? updated : s)),
        );
        setActionFeedback("Đã reset ca thi về trạng thái sẵn sàng.");
      } catch (e) {
        setActionError((e as Error).message || "Không thể reset ca thi.");
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  return {
    tab,
    filter,
    selected,
    searchQuery,
    exams,
    slots,
    loading,
    refreshing,
    error,
    actionLoading,
    actionFeedback,
    actionError,
    visible,
    items,
    roster,
    item: items.find((item) => item.slot.attemptId === selected),
    setFilter,
    setSelected,
    setSearchQuery,
    selectTab,
    refresh: () => loadData(true),
    retry: () => loadData(false),
    markAbsent: handleMarkAbsent,
    resetAttempt: handleResetAttempt,
    clearFeedback: () => {
      setActionFeedback(null);
      setActionError(null);
    },
  };
}
