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

