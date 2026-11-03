import { useCallback, useEffect, useMemo, useState } from "react";
import type { Exam, Slot, SlotStatus } from "../schedule/model";
import { isSlotHistory, lecturerSlots } from "./lecturer-model";
import {
  getCourseEvaluations,
  getExamMonitoring,
  getExamSchedules,
  getLecturerCourses,
  getLecturerExams,
  markCandidateAbsent,
  rescheduleCandidate,
  resetCandidateAttempt,
  updateExamStatus,
  type CourseEvaluationDto,
  type ExamMonitoringDto,
  type LecturerCourseDto,
} from "./lecturer-api";

export type SlotStatusFilter =
  | "ALL"
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABSENT";

export type EvaluationStatusFilter = "ALL" | "PENDING_REVIEW" | "GRADED";

export function useLecturerOverview(
  initialSlots: Slot[] = [],
  token?: string,
  userId?: string,
) {
  const [tab, setTab] = useState<"schedule" | "roster" | "grades" | "profile">(
    "schedule",
  );
  const [filter, setFilter] = useState<"upcoming" | "history">("upcoming");
  const [statusFilter, setStatusFilter] = useState<SlotStatusFilter>("ALL");
  const [selected, setSelected] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<LecturerCourseDto[]>([]);
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [monitoringData, setMonitoringData] = useState<
    Record<string, ExamMonitoringDto>
  >({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Grades / Evaluations
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [evaluationFilter, setEvaluationFilter] =
    useState<EvaluationStatusFilter>("ALL");
  const [evaluations, setEvaluations] = useState<CourseEvaluationDto[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [evaluationsError, setEvaluationsError] = useState<string | null>(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>("");

  const loadData = useCallback(
    async (isPullToRefresh = false) => {
      if (!token) return;
      if (isPullToRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const [fetchedExams, fetchedCourses] = await Promise.all([
          getLecturerExams(token),
          userId
            ? getLecturerCourses(token, userId).catch(() => [])
            : Promise.resolve([]),
        ]);
        setExams(fetchedExams);
        setCourses(fetchedCourses);

        if (fetchedCourses.length > 0) {
          setSelectedCourseId((prev) => prev || fetchedCourses[0].id);
        }

        if (fetchedExams.length === 0) {
          setSlots([]);
          setMonitoringData({});
          return;
        }

        const [scheduleResults, monitorResults] = await Promise.all([
          Promise.allSettled(
            fetchedExams.map((e) => getExamSchedules(token, e.id)),
          ),
          Promise.allSettled(
            fetchedExams.map((e) => getExamMonitoring(token, e.id)),
          ),
        ]);

        const allSlots: Slot[] = [];
        for (const res of scheduleResults) {
          if (res.status === "fulfilled") {
            allSlots.push(...res.value);
          }
        }
        setSlots(allSlots);

        const newMonitoring: Record<string, ExamMonitoringDto> = {};
        for (const res of monitorResults) {
          if (res.status === "fulfilled" && res.value?.examId) {
            newMonitoring[res.value.examId] = res.value;
          }
        }
        setMonitoringData(newMonitoring);
      } catch (e) {
        setError((e as Error).message || "Không thể tải dữ liệu ca thi.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, userId],
  );

  const loadEvaluations = useCallback(
    async (
      courseId: string,
      filterVal: EvaluationStatusFilter = evaluationFilter,
    ) => {
      if (!token || !courseId) return;
      setEvaluationsLoading(true);
      setEvaluationsError(null);
      try {
        const evals = await getCourseEvaluations(token, courseId, {
          status: filterVal === "ALL" ? undefined : filterVal,
        });
        setEvaluations(evals);
      } catch (e) {
        setEvaluationsError(
          (e as Error).message || "Không thể tải dữ liệu đánh giá điểm.",
        );
      } finally {
        setEvaluationsLoading(false);
      }
    },
    [token, evaluationFilter],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (tab === "grades" && selectedCourseId) {
      void loadEvaluations(selectedCourseId, evaluationFilter);
    }
  }, [tab, selectedCourseId, evaluationFilter, loadEvaluations]);

  const items = lecturerSlots(slots, exams);

  const matchesStatus = (status: SlotStatus, filterVal: SlotStatusFilter) => {
    if (filterVal === "ALL") return true;
    if (filterVal === "READY")
      return status === "READY" || status === "SCHEDULED";
    return status === filterVal;
  };

  const statusCounts = useMemo(() => {
    const counts: Record<SlotStatusFilter, number> = {
      ALL: items.length,
      READY: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      ABSENT: 0,
    };
    for (const item of items) {
      if (item.slot.status === "READY" || item.slot.status === "SCHEDULED") {
        counts.READY++;
      } else if (item.slot.status === "IN_PROGRESS") {
        counts.IN_PROGRESS++;
      } else if (item.slot.status === "COMPLETED") {
        counts.COMPLETED++;
      } else if (item.slot.status === "ABSENT") {
        counts.ABSENT++;
      }
    }
    return counts;
  }, [items]);

  const visible = items.filter(
    (item) =>
      (filter === "history"
        ? isSlotHistory(item.slot)
        : !isSlotHistory(item.slot)) &&
      matchesStatus(item.slot.status, statusFilter),
  );

  const query = searchQuery.trim().toLowerCase();
  const roster = items.filter(
    (item) =>
      matchesStatus(item.slot.status, statusFilter) &&
      (!query ||
        item.slot.studentName.toLowerCase().includes(query) ||
        item.slot.studentCode.toLowerCase().includes(query)),
  );

  const selectTab = useCallback((next: typeof tab) => {
    setSelected("");
    setSelectedEvaluationId("");
    setActionFeedback(null);
    setActionError(null);
    setStatusFilter("ALL");
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
        getExamMonitoring(token, examId)
          .then((m) => {
            if (m?.examId)
              setMonitoringData((prev) => ({ ...prev, [m.examId]: m }));
          })
          .catch(() => {});
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
        getExamMonitoring(token, examId)
          .then((m) => {
            if (m?.examId)
              setMonitoringData((prev) => ({ ...prev, [m.examId]: m }));
          })
          .catch(() => {});
        setActionFeedback("Đã reset ca thi về trạng thái sẵn sàng.");
      } catch (e) {
        setActionError((e as Error).message || "Không thể reset ca thi.");
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  const handleReschedule = useCallback(
    async (
      examId: string,
      studentId: string,
      newStartTimeIso: string,
      newEndTimeIso: string,
    ): Promise<boolean> => {
      if (!token) return false;
      setActionLoading(true);
      setActionFeedback(null);
      setActionError(null);
      try {
        const updated = await rescheduleCandidate(token, examId, {
          studentId,
          newScheduledStartTime: newStartTimeIso,
          newScheduledEndTime: newEndTimeIso,
        });
        setSlots((prev) =>
          prev.map((s) => (s.attemptId === updated.attemptId ? updated : s)),
        );
        getExamMonitoring(token, examId)
          .then((m) => {
            if (m?.examId)
              setMonitoringData((prev) => ({ ...prev, [m.examId]: m }));
          })
          .catch(() => {});
        setActionFeedback("Đã đổi ca thi thành công cho thí sinh.");
        return true;
      } catch (e) {
        const msg = (e as Error).message || "Không thể đổi ca thi.";
        setActionError(msg);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  const handleUpdateExamStatus = useCallback(
    async (
      examId: string,
      newStatus: "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    ) => {
      if (!token) return;
      setActionLoading(true);
      setActionFeedback(null);
      setActionError(null);
      try {
        await updateExamStatus(token, examId, newStatus);
        setExams((prev) =>
          prev.map((e) => (e.id === examId ? { ...e, status: newStatus } : e)),
        );
        setActionFeedback(`Đã chuyển trạng thái kỳ thi thành "${newStatus}".`);
      } catch (e) {
        setActionError(
          (e as Error).message || "Không thể cập nhật trạng thái kỳ thi.",
        );
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  return {
    tab,
    filter,
    statusFilter,
    statusCounts,
    selected,
    searchQuery,
    courses,
    exams,
    slots,
    monitoringData,
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
    // Grades / Evaluations
    selectedCourseId,
    evaluationFilter,
    evaluations,
    evaluationsLoading,
    evaluationsError,
    selectedEvaluationId,
    selectedEvaluation: evaluations.find((e) => e.id === selectedEvaluationId),
    setSelectedCourseId,
    setEvaluationFilter,
    setSelectedEvaluationId,
    setFilter,
    setStatusFilter,
    setSelected,
    setSearchQuery,
    selectTab,
    refresh: () => {
      void loadData(true);
      if (tab === "grades" && selectedCourseId) {
        void loadEvaluations(selectedCourseId, evaluationFilter);
      }
    },
    retry: () => {
      void loadData(false);
      if (tab === "grades" && selectedCourseId) {
        void loadEvaluations(selectedCourseId, evaluationFilter);
      }
    },
    markAbsent: handleMarkAbsent,
    resetAttempt: handleResetAttempt,
    reschedule: handleReschedule,
    updateStatus: handleUpdateExamStatus,
    clearFeedback: () => {
      setActionFeedback(null);
      setActionError(null);
    },
  };
}
