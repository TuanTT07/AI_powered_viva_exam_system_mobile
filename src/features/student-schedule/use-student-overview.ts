import { useCallback, useEffect, useState } from "react";
import type { Slot } from "../schedule/model";
import { isHistory, studentExams, type StudentExam } from "./student-model";
import { getStudentResults, type StudentResult, loadStudentAllSlots } from "./student-api";

export function useStudentOverview(
  initialSlots: Slot[] = [],
  studentId?: string,
  token?: string,
) {
  const [tab, setTab] = useState<"schedule" | "grades" | "profile">("schedule");
  const [filter, setFilter] = useState<"upcoming" | "history">("upcoming");
  const [selected, setSelected] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState("");

  const [items, setItems] = useState<StudentExam[]>(() =>
    studentExams(initialSlots, studentId),
  );
  const [grades, setGrades] = useState<Record<string, StudentResult[]>>({});
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [gradesRevision, setGradesRevision] = useState(0);
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

  useEffect(() => {
    if (tab !== "grades" || !token || loading) return;
    const controller = new AbortController();
    setGradesLoading(true);
    setGradesError(null);
    setGrades({});
    void Promise.all(items.filter((item) => item.slot.status === "COMPLETED").map(async (item) =>
      [item.slot.attemptId, await getStudentResults(token, item.slot.attemptId, controller.signal)] as const,
    )).then((entries) => {
      if (!controller.signal.aborted) setGrades(Object.fromEntries(entries));
    }).catch((error: Error) => {
      if (!controller.signal.aborted) setGradesError(error.message);
    }).finally(() => {
      if (!controller.signal.aborted) setGradesLoading(false);
    });
    return () => controller.abort();
  }, [tab, token, items, loading, gradesRevision]);

  const visible = items.filter((item) =>
    filter === "history" ? isHistory(item) : !isHistory(item),
  );

  // ponytail: sum only published scores; the API provides no aggregate or grading weights.
  const results = items.flatMap((entry) => {
    const questions = grades[entry.slot.attemptId];
    return questions?.length ? [{
      ...entry,
      questions,
      total: questions.reduce((sum, question) => sum + question.finalScore, 0),
    }] : [];
  });

  const selectTab = useCallback((next: typeof tab) => {
    setSelected("");
    setTab(next);
  }, []);

  return {
    tab,
    results,
    selectedGrade: results.find((entry) => entry.slot.attemptId === selected),
    expandedFeedback,
    toggleFeedback: (key: string) => setExpandedFeedback((current) => current === key ? "" : key),
    gradesLoading,
    gradesError,
    retryGrades: () => setGradesRevision((value) => value + 1),
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
