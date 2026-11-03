import { apiRequest, ApiError } from "../../services/api/client";
import { getLecturerExams } from "../lecturer-schedule/lecturer-api";
import type { StudentExam } from "./student-model";

export type BackendStudentExamSummaryDto = {
  examId: string;
  attemptId: string;
  examTitle: string;
  courseCode: string;
  courseName: string;
  slotNumber: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: "SCHEDULED" | "READY" | "IN_PROGRESS" | "COMPLETED" | "ABSENT" | "CANCELLED";
};

export type BackendPageStudentExams = {
  content: BackendStudentExamSummaryDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type BackendStudentSlotDto = {
  attemptId: string;
  examId: string;
  examTitle: string;
  courseCode: string;
  courseName: string;
  slotNumber: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: "SCHEDULED" | "READY" | "IN_PROGRESS" | "COMPLETED" | "ABSENT" | "CANCELLED";
  accessCode?: string | null;
  examConfig?: {
    maxMainQuestions?: number;
    maxFollowUpQuestions?: number;
    timeLimitPerTurnSeconds?: number;
    antiOverlapEnabled?: boolean;
  };
  questions?: Array<{
    questionAttemptId?: string;
    questionId: string;
    content: string;
    order?: number;
  }>;
};

export async function getStudentExams(
  token: string,
  options?: {
    page?: number;
    size?: number;
    status?: string;
    signal?: AbortSignal;
  },
): Promise<BackendStudentExamSummaryDto[]> {
  const query = new URLSearchParams({
    page: String(options?.page ?? 0),
    size: String(options?.size ?? 50),
  });
  if (options?.status) {
    query.set("status", options.status);
  }

  const result = (await apiRequest(
    `/api/v1/student/exams?${query.toString()}`,
    {
      method: "GET",
      token,
      signal: options?.signal,
    },
  )) as BackendPageStudentExams;

  return Array.isArray(result?.content) ? result.content : [];
}

export async function getStudentMySlot(
  token: string,
  examId: string,
  studentId?: string,
  options?: { signal?: AbortSignal },
): Promise<BackendStudentSlotDto | null> {
  try {
    const qs = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
    const result = (await apiRequest(
      `/api/v1/student/exams/${encodeURIComponent(examId)}/my-slot${qs}`,
      {
        method: "GET",
        token,
        signal: options?.signal,
      },
    )) as BackendStudentSlotDto;

    return result && result.attemptId ? result : null;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return null;
    }
    throw error;
  }
}

export async function loadStudentAllSlots(
  token: string,
  studentId: string,
  options?: { signal?: AbortSignal },
): Promise<StudentExam[]> {
  try {
    const summaries = await getStudentExams(token, options);
    if (summaries && summaries.length > 0) {
      const slotResults = await Promise.allSettled(
        summaries.map((s) =>
          getStudentMySlot(token, s.examId, studentId, options),
        ),
      );

      return summaries
        .map((s, index) => {
          const detail =
            slotResults[index].status === "fulfilled"
              ? slotResults[index].value
              : null;
          return {
            exam: {
              id: s.examId,
              title: s.examTitle,
              courseCode: s.courseCode,
              courseName: s.courseName,
              startTime: s.scheduledStartTime,
              status: s.status,
            },
            slot: {
              attemptId: s.attemptId,
              examId: s.examId,
              studentId,
              studentCode: "",
              studentName: "",
              slotNumber: s.slotNumber,
              scheduledStartTime: s.scheduledStartTime,
              scheduledEndTime: s.scheduledEndTime,
              status: s.status,
            },
            accessCode: detail?.accessCode,
            questions: detail?.questions,
          };
        })
        .sort(
          (a, b) =>
            Date.parse(a.slot.scheduledStartTime) -
            Date.parse(b.slot.scheduledStartTime),
        );
    }
  } catch {
    // If student/exams endpoint is unavailable, fall through to general exam query
  }

  const exams = await getLecturerExams(token, options);
  if (!exams.length) return [];

  const slotResults = await Promise.allSettled(
    exams.map((exam) => getStudentMySlot(token, exam.id, studentId, options)),
  );

  const studentExamsList: StudentExam[] = [];

  for (let i = 0; i < exams.length; i++) {
    const res = slotResults[i];
    if (res.status === "fulfilled" && res.value) {
      const slotDto = res.value;
      const exam = exams[i];
      studentExamsList.push({
        exam: {
          id: exam.id,
          title: slotDto.examTitle || exam.title,
          courseCode: slotDto.courseCode || exam.courseCode,
          courseName: slotDto.courseName || exam.courseName,
          startTime: slotDto.scheduledStartTime || exam.startTime,
          status: exam.status,
        },
        slot: {
          attemptId: slotDto.attemptId,
          examId: exam.id,
          studentId,
          studentCode: "",
          studentName: "",
          slotNumber: slotDto.slotNumber,
          scheduledStartTime: slotDto.scheduledStartTime,
          scheduledEndTime: slotDto.scheduledEndTime,
          status: slotDto.status,
        },
        accessCode: slotDto.accessCode,
        questions: slotDto.questions,
      });
    }
  }

  return studentExamsList.sort(
    (a, b) =>
      Date.parse(a.slot.scheduledStartTime) -
      Date.parse(b.slot.scheduledStartTime),
  );
}
