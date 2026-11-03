import { apiRequest } from "../../services/api/client";
import type { Exam, Slot } from "../schedule/model";

export type BackendExamDto = {
  id: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt?: string;
};

export type BackendPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type BackendCandidateScheduleDto = {
  attemptId: string;
  examId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  studentEmail?: string;
  slotNumber: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: "SCHEDULED" | "READY" | "IN_PROGRESS" | "COMPLETED" | "ABSENT" | "CANCELLED";
  accessCode?: string | null;
};

export function mapBackendExam(dto: BackendExamDto): Exam {
  return {
    id: dto.id,
    title: dto.title,
    courseCode: dto.courseCode ?? "—",
    courseName: dto.courseName ?? "Học phần",
    startTime: dto.startTime,
    status: dto.status,
  };
}

export function mapBackendSlot(dto: BackendCandidateScheduleDto): Slot {
  return {
    attemptId: dto.attemptId,
    examId: dto.examId,
    studentId: dto.studentId,
    studentCode: dto.studentCode,
    studentName: dto.studentName,
    slotNumber: dto.slotNumber,
    scheduledStartTime: dto.scheduledStartTime,
    scheduledEndTime: dto.scheduledEndTime,
    status: dto.status,
  };
}

export async function getLecturerExams(
  token: string,
  options?: { signal?: AbortSignal },
): Promise<Exam[]> {
  const result = (await apiRequest(
    "/api/v1/exams?size=50&sortBy=startTime&direction=ASC",
    {
      method: "GET",
      token,
      signal: options?.signal,
    },
  )) as BackendPage<BackendExamDto>;

  const content = Array.isArray(result?.content) ? result.content : [];
  return content.map(mapBackendExam);
}

export async function getExamSchedules(
  token: string,
  examId: string,
  options?: { signal?: AbortSignal },
): Promise<Slot[]> {
  const result = (await apiRequest(
    `/api/v1/exams/${encodeURIComponent(examId)}/schedule`,
    {
      method: "GET",
      token,
      signal: options?.signal,
    },
  )) as BackendCandidateScheduleDto[];

  const list = Array.isArray(result) ? result : [];
  return list.map(mapBackendSlot);
}

export async function markCandidateAbsent(
  token: string,
  examId: string,
  attemptId: string,
  options?: { signal?: AbortSignal },
): Promise<Slot> {
  const result = (await apiRequest(
    `/api/v1/exams/${encodeURIComponent(examId)}/attempts/${encodeURIComponent(attemptId)}/absent`,
    {
      method: "POST",
      token,
      signal: options?.signal,
    },
  )) as BackendCandidateScheduleDto;

  return mapBackendSlot(result);
}

export async function resetCandidateAttempt(
  token: string,
  examId: string,
  attemptId: string,
  options?: { signal?: AbortSignal },
): Promise<Slot> {
  const result = (await apiRequest(
    `/api/v1/exams/${encodeURIComponent(examId)}/attempts/${encodeURIComponent(attemptId)}/reset`,
    {
      method: "POST",
      token,
      signal: options?.signal,
    },
  )) as BackendCandidateScheduleDto;

  return mapBackendSlot(result);
}

export type ExamMonitoringDto = {
  examId: string;
  examTitle: string;
  totalCandidates: number;
  scheduledCount: number;
  readyCount: number;
  inProgressCount: number;
  completedCount: number;
  absentCount: number;
  completionRate: number;
};

export async function getExamMonitoring(
  token: string,
  examId: string,
  options?: { signal?: AbortSignal },
): Promise<ExamMonitoringDto> {
  const result = (await apiRequest(
    `/api/v1/exams/${encodeURIComponent(examId)}/monitor`,
    {
      method: "GET",
      token,
      signal: options?.signal,
    },
  )) as ExamMonitoringDto;

  return result;
}

export type RescheduleRequest = {
  studentId: string;
  newScheduledStartTime: string;
  newScheduledEndTime: string;
};

export async function rescheduleCandidate(
  token: string,
  examId: string,
  request: RescheduleRequest,
  options?: { signal?: AbortSignal },
): Promise<Slot> {
  const result = (await apiRequest(
    `/api/v1/exams/${encodeURIComponent(examId)}/schedule/reschedule`,
    {
      method: "PUT",
      token,
      body: request,
      signal: options?.signal,
    },
  )) as BackendCandidateScheduleDto;

  return mapBackendSlot(result);
}

export type LecturerCourseDto = {
  id: string;
  courseCode: string;
  courseName: string;
  department?: string;
  createdAt?: string;
};

export async function getLecturerCourses(
  token: string,
  lecturerId: string,
  options?: { signal?: AbortSignal },
): Promise<LecturerCourseDto[]> {
  const result = (await apiRequest(
    `/api/lecturers/${encodeURIComponent(lecturerId)}/courses`,
    {
      method: "GET",
      token,
      signal: options?.signal,
    },
  )) as LecturerCourseDto[];

  return Array.isArray(result) ? result : [];
}

export type CriterionScoreDto = {
  criterionId: string;
  criterionName: string;
  maxScore: number;
  aiScore: number;
  finalScore: number;
  comment?: string;
};

export type CourseEvaluationDto = {
  id: string;
  questionAttemptId: string;
  questionId: string;
  questionContent: string;
  gradedById?: string;
  gradedByName?: string;
  aiSuggestedScore?: number;
  finalScore?: number;
  maxScore?: number;
  overallFeedback?: string;
  criteria?: CriterionScoreDto[];
  status: "PENDING_REVIEW" | "GRADED";
  createdAt: string;
  updatedAt?: string;
};

export type CourseEvaluationsPageDto = {
  content: CourseEvaluationDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export async function getCourseEvaluations(
  token: string,
  courseId: string,
  options?: {
    status?: "PENDING_REVIEW" | "GRADED";
    page?: number;
    size?: number;
    signal?: AbortSignal;
  },
): Promise<CourseEvaluationDto[]> {
  const query = new URLSearchParams({
    page: String(options?.page ?? 0),
    size: String(options?.size ?? 50),
  });
  if (options?.status) {
    query.set("status", options.status);
  }

  const result = (await apiRequest(
    `/api/courses/${encodeURIComponent(courseId)}/evaluations?${query.toString()}`,
    {
      method: "GET",
      token,
      signal: options?.signal,
    },
  )) as CourseEvaluationsPageDto | { content?: CourseEvaluationDto[] };

  const content = Array.isArray(result?.content) ? result.content : [];
  return content;
}

export async function getQuestionEvaluationDetail(
  token: string,
  questionAttemptId: string,
  options?: { signal?: AbortSignal },
): Promise<CourseEvaluationDto> {
  const result = (await apiRequest(
    `/api/question-attempts/${encodeURIComponent(questionAttemptId)}/evaluation`,
    {
      method: "GET",
      token,
      signal: options?.signal,
    },
  )) as CourseEvaluationDto;

  return result;
}

export async function updateExamStatus(
  token: string,
  examId: string,
  status: "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  options?: { signal?: AbortSignal },
): Promise<void> {
  await apiRequest(
    `/api/v1/exams/${encodeURIComponent(examId)}/status`,
    {
      method: "PATCH",
      token,
      body: { status },
      signal: options?.signal,
    },
  );
}


