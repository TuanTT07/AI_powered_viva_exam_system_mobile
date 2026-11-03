import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { AuthUser } from "../auth/auth-model";
import { Icon } from "../../components/ui/Icon";
import { Brand } from "../../components/ui/Brand";
import { dateKey, day, labels, time, type Slot } from "../schedule/model";
import {
  useLecturerOverview,
  type SlotStatusFilter,
} from "./use-lecturer-overview";
import {
  Action,
  Empty,
  palette,
  Reveal,
  s,
  Surface,
  Type,
} from "../../components/ui/mobile";

const tabs = [
  { id: "schedule", label: "Lịch coi thi", icon: "calendar" },
  { id: "roster", label: "Danh sách thi", icon: "list" },
  { id: "grades", label: "Điểm thi", icon: "score" },
  { id: "profile", label: "Hồ sơ", icon: "profile" },
] as const;

const statusOptions: { id: SlotStatusFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "READY", label: "Sẵn sàng" },
  { id: "IN_PROGRESS", label: "Đang thi" },
  { id: "ABSENT", label: "Vắng mặt" },
  { id: "COMPLETED", label: "Hoàn tất" },
];

export function LecturerScheduleScreen({
  slots: initialSlots = [],
  token,
  onExit,
  user,
  onChangePassword,
  busy,
}: {
  slots?: Slot[];
  token?: string;
  onExit: () => void;
  user: AuthUser;
  onChangePassword: () => void;
  busy: boolean;
}) {
  const {
    tab,
    filter,
    statusFilter,
    statusCounts,
    selected,
    searchQuery,
    exams,
    courses,
    slots,
    monitoringData,
    loading,
    refreshing,
    error,
    actionLoading,
    actionFeedback,
    actionError,
    item,
    visible,
    items,
    roster,
    selectedCourseId,
    evaluationFilter,
    evaluations,
    evaluationsLoading,
    evaluationsError,
    selectedEvaluationId,
    selectedEvaluation,
    setSelectedCourseId,
    setEvaluationFilter,
    setSelectedEvaluationId,
    setSelected,
    setFilter,
    setStatusFilter,
    setSearchQuery,
    selectTab,
    refresh,
    retry,
    markAbsent,
    resetAttempt,
    reschedule,
    updateStatus,
    clearFeedback,
  } = useLecturerOverview(initialSlots, token, user.id);

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");
  const [rescheduleFormError, setRescheduleFormError] = useState("");

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedEvaluationId) {
        setSelectedEvaluationId("");
      } else if (selected) {
        setSelected("");
        setShowReschedule(false);
      } else if (tab !== "schedule") {
        selectTab("schedule");
      } else {
        return false;
      }
      return true;
    });
    return () => sub.remove();
  }, [selected, selectedEvaluationId, tab, onExit, setSelected, setSelectedEvaluationId, selectTab]);

  return (
    <View style={styles.root}>
      <View style={styles.brandRow}>
        <Brand />
        <View style={styles.role}>
          <Type style={s.eyebrow}>GIẢNG VIÊN</Type>
        </View>
      </View>
      <ScrollView
        key={`${tab}-${selected}-${selectedEvaluationId}`}
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[palette.blue]}
            tintColor={palette.blue}
          />
        }
      >
        <Reveal>
          {actionFeedback ? (
            <Surface style={styles.feedbackSuccess}>
              <View style={s.row}>
                <Type style={{ color: "#065f46", flex: 1 }}>
                  {actionFeedback}
                </Type>
                <Pressable onPress={clearFeedback}>
                  <Type style={{ color: "#065f46", fontFamily: "JakartaBold" }}>
                    ✕
                  </Type>
                </Pressable>
              </View>
            </Surface>
          ) : null}

          {actionError ? (
            <Surface style={styles.feedbackError}>
              <View style={s.row}>
                <Type style={{ color: "#b91c1c", flex: 1 }}>
                  {actionError}
                </Type>
                <Pressable onPress={clearFeedback}>
                  <Type style={{ color: "#b91c1c", fontFamily: "JakartaBold" }}>
                    ✕
                  </Type>
                </Pressable>
              </View>
            </Surface>
          ) : null}

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={palette.blue} size="large" />
              <Type style={s.muted}>Đang tải dữ liệu kỳ thi…</Type>
            </View>
          ) : error ? (
            <Surface>
              <Type accessibilityRole="header" style={s.h2}>
                Chưa thể tải dữ liệu
              </Type>
              <Type accessibilityRole="alert" style={s.muted}>
                {error}
              </Type>
              <Action label="Thử lại" onPress={retry} />
            </Surface>
          ) : selected && item ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Quay lại"
                onPress={() => {
                  setSelected("");
                  setShowReschedule(false);
                }}
                style={styles.back}
              >
                <Icon name="back" />
                <Type style={{ color: palette.blue }}>Quay lại</Type>
              </Pressable>
              <View style={s.section}>
                <Type style={s.eyebrow}>CHI TIẾT CA THI</Type>
                <Type accessibilityRole="header" aria-level={1} style={s.h1}>
                  {item.exam?.title || "Ca thi vấn đáp"}
                </Type>
                {item.exam && (
                  <Type style={s.muted}>
                    {item.exam.courseCode} · {item.exam.courseName}
                  </Type>
                )}
              </View>
              <Surface>
                <View style={styles.status}>
                  <Type style={{ color: palette.blue }}>
                    {labels[item.slot.status] || item.slot.status}
                  </Type>
                </View>
                <Type style={s.h2}>{day(item.slot.scheduledStartTime)}</Type>
                <View style={[s.row, { flexWrap: "wrap" }]}>
                  <Icon name="clock" />
                  <Type style={[s.h1, { color: palette.blue, fontSize: 27 }]}>
                    {time(item.slot.scheduledStartTime)} –{" "}
                    {time(item.slot.scheduledEndTime)}
                  </Type>
                </View>
                <View style={s.rule} />
                <Type>Thí sinh · {item.slot.studentName}</Type>
                <Type style={s.muted}>Mã sinh viên: {item.slot.studentCode}</Type>
                <Type>
                  Số thứ tự · STT {String(item.slot.slotNumber).padStart(2, "0")}
                </Type>
                <Type style={s.detailLabel}>Giờ Việt Nam · UTC+7</Type>
              </Surface>

              {(item.slot.status === "SCHEDULED" ||
                item.slot.status === "READY") && (
                <Surface>
                  <Type style={s.eyebrow}>THAO TÁC CA THI</Type>
                  {!showReschedule ? (
                    <>
                      <Action
                        secondary
                        disabled={actionLoading}
                        label="Đổi lịch ca thi"
                        icon="calendar"
                        onPress={() => {
                          setRescheduleDate(
                            dateKey(item.slot.scheduledStartTime),
                          );
                          setRescheduleStart(time(item.slot.scheduledStartTime));
                          setRescheduleEnd(time(item.slot.scheduledEndTime));
                          setRescheduleFormError("");
                          setShowReschedule(true);
                        }}
                      />
                      <Action
                        secondary
                        disabled={actionLoading}
                        label={
                          actionLoading
                            ? "Đang ghi nhận…"
                            : "Ghi nhận thí sinh vắng thi"
                        }
                        onPress={() =>
                          void markAbsent(item.slot.examId, item.slot.attemptId)
                        }
                      />
                      <Type style={s.detailLabel}>
                        Đổi lịch hoặc đánh dấu thí sinh vắng mặt nếu không tham gia ca thi.
                      </Type>
                    </>
                  ) : (
                    <View style={{ gap: 12 }}>
                      <Type style={s.h2}>Đổi lịch ca thi</Type>
                      <Type style={s.muted}>
                        Nhập ngày thi và khung giờ mới cho thí sinh{" "}
                        {item.slot.studentName}.
                      </Type>

                      {rescheduleFormError ? (
                        <Type style={{ color: "#b91c1c", fontSize: 13 }}>
                          {rescheduleFormError}
                        </Type>
                      ) : null}

                      <View>
                        <Type style={s.detailLabel}>Ngày thi (YYYY-MM-DD)</Type>
                        <TextInput
                          accessibilityLabel="Ngày thi mới"
                          style={styles.formInput}
                          value={rescheduleDate}
                          onChangeText={setRescheduleDate}
                          placeholder="2026-11-05"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numbers-and-punctuation"
                        />
                      </View>

                      <View style={[s.row, { gap: 12 }]}>
                        <View style={{ flex: 1 }}>
                          <Type style={s.detailLabel}>Bắt đầu (HH:mm)</Type>
                          <TextInput
                            accessibilityLabel="Giờ bắt đầu"
                            style={styles.formInput}
                            value={rescheduleStart}
                            onChangeText={setRescheduleStart}
                            placeholder="08:00"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numbers-and-punctuation"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Type style={s.detailLabel}>Kết thúc (HH:mm)</Type>
                          <TextInput
                            accessibilityLabel="Giờ kết thúc"
                            style={styles.formInput}
                            value={rescheduleEnd}
                            onChangeText={setRescheduleEnd}
                            placeholder="08:20"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numbers-and-punctuation"
                          />
                        </View>
                      </View>

                      <Action
                        disabled={actionLoading}
                        label={
                          actionLoading ? "Đang cập nhật…" : "Xác nhận đổi lịch"
                        }
                        onPress={async () => {
                          if (
                            !/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate) ||
                            !/^([01]\d|2[0-3]):[0-5]\d$/.test(rescheduleStart) ||
                            !/^([01]\d|2[0-3]):[0-5]\d$/.test(rescheduleEnd)
                          ) {
                            setRescheduleFormError(
                              "Vui lòng nhập ngày (YYYY-MM-DD) và giờ (HH:mm) đúng định dạng.",
                            );
                            return;
                          }
                          const from = `${rescheduleDate}T${rescheduleStart}:00+07:00`;
                          const to = `${rescheduleDate}T${rescheduleEnd}:00+07:00`;
                          if (Date.parse(to) <= Date.parse(from)) {
                            setRescheduleFormError(
                              "Giờ kết thúc phải sau giờ bắt đầu.",
                            );
                            return;
                          }
                          setRescheduleFormError("");
                          const success = await reschedule(
                            item.slot.examId,
                            item.slot.studentId,
                            new Date(from).toISOString(),
                            new Date(to).toISOString(),
                          );
                          if (success) {
                            setShowReschedule(false);
                          }
                        }}
                      />

                      <Action
                        secondary
                        disabled={actionLoading}
                        label="Hủy"
                        onPress={() => setShowReschedule(false)}
                      />
                    </View>
                  )}
                </Surface>
              )}

              {(item.slot.status === "IN_PROGRESS" ||
                item.slot.status === "ABSENT") && (
                <Surface>
                  <Type style={s.eyebrow}>XỬ LÝ SỰ CỐ</Type>
                  <Action
                    secondary
                    disabled={actionLoading}
                    label={
                      actionLoading
                        ? "Đang xử lý…"
                        : "Reset ca thi về Sẵn sàng"
                    }
                    onPress={() =>
                      void resetAttempt(item.slot.examId, item.slot.attemptId)
                    }
                  />
                  <Type style={s.detailLabel}>
                    Đặt lại lượt thi về trạng thái sẵn sàng khi thí sinh gặp sự
                    cố kỹ thuật.
                  </Type>
                </Surface>
              )}
            </>
          ) : tab === "schedule" ? (
            <>
              <View style={s.section}>
                <Type style={s.eyebrow}>LỊCH PHÂN CÔNG</Type>
                <Type accessibilityRole="header" aria-level={1} style={s.h1}>
                  Lịch coi thi
                </Type>
                <Type style={s.muted}>Các ca thi vấn đáp được phân công.</Type>
              </View>

              {exams.length > 0 && (
                <View style={{ gap: 12, marginBottom: 16 }}>
                  <Type style={s.eyebrow}>KỲ THI PHỤ TRÁCH ({exams.length})</Type>
                  {exams.map((ex) => {
                    const examSlots = slots.filter((s) => s.examId === ex.id);
                    const monitor = monitoringData[ex.id];
                    const rate = monitor
                      ? monitor.completionRate <= 1
                        ? Math.round(monitor.completionRate * 100)
                        : Math.round(monitor.completionRate)
                      : 0;

                    return (
                      <Surface key={ex.id}>
                        <View style={s.row}>
                          <Type style={s.eyebrow}>{ex.courseCode}</Type>
                          <View style={[styles.status, { marginLeft: "auto" }]}>
                            <Type style={{ color: palette.blue, fontSize: 12 }}>
                              {ex.status === "DRAFT"
                                ? "Bản nháp"
                                : ex.status === "PUBLISHED"
                                  ? "Đã công bố"
                                  : ex.status === "IN_PROGRESS"
                                    ? "Đang diễn ra"
                                    : ex.status === "COMPLETED"
                                      ? "Hoàn tất"
                                      : ex.status}
                            </Type>
                          </View>
                        </View>
                        <Type style={s.h2}>{ex.title}</Type>
                        <Type style={s.muted}>{ex.courseName}</Type>
                        <View style={s.row}>
                          <Icon name="calendar" size={18} />
                          <Type style={{ flex: 1 }}>{day(ex.startTime)}</Type>
                        </View>

                        {monitor && (
                          <View style={styles.monitorCard}>
                            <View
                              style={[
                                s.row,
                                { justifyContent: "space-between" },
                              ]}
                            >
                              <Type style={styles.monitorTitle}>
                                Tiến độ ca thi
                              </Type>
                              <Type style={styles.monitorRate}>
                                {rate}% hoàn tất
                              </Type>
                            </View>
                            <View style={styles.progressBarTrack}>
                              <View
                                style={[
                                  styles.progressBarThumb,
                                  {
                                    width: `${Math.min(100, Math.max(0, rate))}%`,
                                  },
                                ]}
                              />
                            </View>
                            <View style={styles.monitorStatsRow}>
                              <View style={styles.monitorStatBox}>
                                <Type style={styles.statNumber}>
                                  {monitor.totalCandidates}
                                </Type>
                                <Type style={styles.statLabel}>Tổng số</Type>
                              </View>
                              <View style={styles.monitorStatBox}>
                                <Type
                                  style={[
                                    styles.statNumber,
                                    { color: palette.blue },
                                  ]}
                                >
                                  {monitor.readyCount}
                                </Type>
                                <Type style={styles.statLabel}>Sẵn sàng</Type>
                              </View>
                              <View style={styles.monitorStatBox}>
                                <Type
                                  style={[
                                    styles.statNumber,
                                    { color: "#f59e0b" },
                                  ]}
                                >
                                  {monitor.inProgressCount}
                                </Type>
                                <Type style={styles.statLabel}>Đang thi</Type>
                              </View>
                              <View style={styles.monitorStatBox}>
                                <Type
                                  style={[
                                    styles.statNumber,
                                    { color: "#10b981" },
                                  ]}
                                >
                                  {monitor.completedCount}
                                </Type>
                                <Type style={styles.statLabel}>Hoàn tất</Type>
                              </View>
                              <View style={styles.monitorStatBox}>
                                <Type
                                  style={[
                                    styles.statNumber,
                                    { color: "#ef4444" },
                                  ]}
                                >
                                  {monitor.absentCount}
                                </Type>
                                <Type style={styles.statLabel}>Vắng thi</Type>
                              </View>
                            </View>
                          </View>
                        )}

                        <Type style={s.detailLabel}>
                          {examSlots.length > 0
                            ? `${examSlots.length} ca thi đã được xếp lịch`
                            : "Kỳ thi chưa có ca thi nào được xếp lịch"}
                        </Type>

                        {ex.status === "PUBLISHED" ? (
                          <View style={{ marginTop: 8 }}>
                            <Action
                              secondary
                              disabled={actionLoading}
                              label="Bắt đầu kỳ thi (IN_PROGRESS)"
                              onPress={() => updateStatus(ex.id, "IN_PROGRESS")}
                            />
                          </View>
                        ) : ex.status === "IN_PROGRESS" ? (
                          <View style={{ marginTop: 8 }}>
                            <Action
                              secondary
                              disabled={actionLoading}
                              label="Hoàn tất kỳ thi (COMPLETED)"
                              onPress={() => updateStatus(ex.id, "COMPLETED")}
                            />
                          </View>
                        ) : null}
                      </Surface>
                    );
                  })}
                </View>
              )}

              <View style={s.section}>
                <Type style={s.eyebrow}>DANH SÁCH CA THI</Type>
                <Type style={s.muted}>Các ca thi chi tiết của từng thí sinh.</Type>
              </View>

              <View style={styles.filters}>
                {(["upcoming", "history"] as const).map((id) => (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filter === id }}
                    aria-pressed={filter === id}
                    onPress={() => setFilter(id)}
                    style={[
                      styles.filter,
                      filter === id && styles.activeFilter,
                    ]}
                  >
                    <Type
                      style={{
                        color: filter === id ? palette.blue : "#475569",
                        fontFamily: "JakartaBold",
                      }}
                    >
                      {id === "upcoming" ? "Sắp tới" : "Đã qua"}
                    </Type>
                  </Pressable>
                ))}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.statusChipsContainer}
                contentContainerStyle={styles.statusChipsRow}
              >
                {statusOptions.map((opt) => {
                  const count = statusCounts[opt.id];
                  const active = statusFilter === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${opt.label} (${count})`}
                      accessibilityState={{ selected: active }}
                      onPress={() => setStatusFilter(opt.id)}
                      style={[
                        styles.statusChip,
                        active && styles.statusChipActive,
                      ]}
                    >
                      <Type
                        style={[
                          styles.statusChipText,
                          active && styles.statusChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Type>
                      <View
                        style={[
                          styles.statusChipBadge,
                          active && styles.statusChipBadgeActive,
                        ]}
                      >
                        <Type
                          style={[
                            styles.statusChipBadgeText,
                            active && styles.statusChipBadgeTextActive,
                          ]}
                        >
                          {count}
                        </Type>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {visible.length ? (
                visible.map((entry) => (
                  <Surface key={entry.slot.attemptId}>
                    {entry.exam && (
                      <Type style={s.eyebrow}>{entry.exam.courseCode}</Type>
                    )}
                    <Type style={s.h2}>
                      {entry.exam?.title || "Ca thi vấn đáp"}
                    </Type>
                    <View style={s.row}>
                      <Icon name="calendar" size={20} />
                      <Type style={{ flex: 1 }}>
                        {day(entry.slot.scheduledStartTime)}
                      </Type>
                    </View>
                    <Type style={[s.h2, { color: palette.blue }]}>
                      {time(entry.slot.scheduledStartTime)} –{" "}
                      {time(entry.slot.scheduledEndTime)}
                    </Type>
                    <Type>
                      Thí sinh: {entry.slot.studentName} ({entry.slot.studentCode})
                    </Type>
                    <Type style={s.muted}>
                      {labels[entry.slot.status] || entry.slot.status}
                    </Type>
                    <Action
                      label="Chi tiết ca thi"
                      onPress={() => setSelected(entry.slot.attemptId)}
                    />
                  </Surface>
                ))
              ) : (
                <Empty
                  icon="calendar"
                  title="Chưa có ca thi nào"
                  description={
                    exams.length === 0
                      ? "Tài khoản giảng viên chưa có kỳ thi hoặc chưa được phân công môn học trong hệ thống."
                      : statusFilter !== "ALL"
                        ? "Không có ca thi nào phù hợp với bộ lọc trạng thái đã chọn."
                        : "Kỳ thi đã được tạo nhưng chưa xếp ca thi cho thí sinh (cần auto-schedule trên web quản trị)."
                  }
                />
              )}
              <View style={styles.note}>
                <Icon name="clock" size={18} color={palette.muted} />
                <Type style={[s.detailLabel, { flex: 1 }]}>
                  Lịch coi thi hiển thị theo giờ Việt Nam (UTC+7). Kéo xuống để làm mới.
                </Type>
              </View>
            </>
          ) : tab === "roster" ? (
            <>
              <View style={s.section}>
                <Type style={s.eyebrow}>THÍ SINH & CA THI</Type>
                <Type accessibilityRole="header" aria-level={1} style={s.h1}>
                  Danh sách thi
                </Type>
                <Type style={s.muted}>
                  Danh sách thí sinh trong các ca thi phụ trách.
                </Type>
              </View>
              {items.length > 0 ? (
                <>
                  <TextInput
                    accessibilityLabel="Tìm kiếm thí sinh"
                    placeholder="Tìm theo tên hoặc mã sinh viên…"
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                  />

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.statusChipsContainer}
                    contentContainerStyle={styles.statusChipsRow}
                  >
                    {statusOptions.map((opt) => {
                      const count = statusCounts[opt.id];
                      const active = statusFilter === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          accessibilityRole="button"
                          accessibilityLabel={`${opt.label} (${count})`}
                          accessibilityState={{ selected: active }}
                          onPress={() => setStatusFilter(opt.id)}
                          style={[
                            styles.statusChip,
                            active && styles.statusChipActive,
                          ]}
                        >
                          <Type
                            style={[
                              styles.statusChipText,
                              active && styles.statusChipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Type>
                          <View
                            style={[
                              styles.statusChipBadge,
                              active && styles.statusChipBadgeActive,
                            ]}
                          >
                            <Type
                              style={[
                                styles.statusChipBadgeText,
                                active && styles.statusChipBadgeTextActive,
                              ]}
                            >
                              {count}
                            </Type>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {roster.length ? (
                    roster.map((entry) => (
                      <Surface key={entry.slot.attemptId}>
                        <View style={s.row}>
                          <Type style={s.eyebrow}>
                            STT {String(entry.slot.slotNumber).padStart(2, "0")}
                          </Type>
                          <View
                            style={[
                              styles.status,
                              {
                                marginLeft: "auto",
                                paddingVertical: 2,
                                paddingHorizontal: 8,
                              },
                            ]}
                          >
                            <Type
                              style={{
                                color: palette.blue,
                                fontSize: 11,
                                fontFamily: "JakartaBold",
                              }}
                            >
                              {labels[entry.slot.status] || entry.slot.status}
                            </Type>
                          </View>
                        </View>
                        <Type style={s.h2}>{entry.slot.studentName}</Type>
                        <Type style={s.muted}>
                          Mã sinh viên: {entry.slot.studentCode}
                        </Type>
                        <Type style={{ color: palette.blue }}>
                          {day(entry.slot.scheduledStartTime)} ·{" "}
                          {time(entry.slot.scheduledStartTime)}
                        </Type>
                        <Action
                          secondary
                          label="Xem ca thi"
                          onPress={() => setSelected(entry.slot.attemptId)}
                        />
                      </Surface>
                    ))
                  ) : (
                    <Empty
                      icon="score"
                      title="Không tìm thấy thí sinh"
                      description={
                        statusFilter !== "ALL"
                          ? "Không có thí sinh nào phù hợp với bộ lọc trạng thái và từ khóa tìm kiếm."
                          : "Thử tìm kiếm với từ khóa khác."
                      }
                    />
                  )}
                </>
              ) : (
                <Empty
                  icon="score"
                  title="Chưa có dữ liệu danh sách thi"
                  description="Danh sách thí sinh sẽ hiển thị khi kỳ thi được lên lịch."
                />
              )}
            </>
          ) : tab === "grades" ? (
            selectedEvaluation ? (
              <>
                <Action
                  secondary
                  label="Quay lại danh sách đánh giá"
                  icon="back"
                  onPress={() => setSelectedEvaluationId("")}
                />
                <Surface>
                  <View style={s.row}>
                    <Type style={s.eyebrow}>CHI TIẾT ĐÁNH GIÁ</Type>
                    <View
                      style={[
                        styles.status,
                        {
                          marginLeft: "auto",
                          backgroundColor:
                            selectedEvaluation.status === "GRADED"
                              ? "#ecfdf5"
                              : "#fef3c7",
                        },
                      ]}
                    >
                      <Type
                        style={{
                          color:
                            selectedEvaluation.status === "GRADED"
                              ? "#059669"
                              : "#d97706",
                          fontSize: 12,
                          fontFamily: "JakartaBold",
                        }}
                      >
                        {selectedEvaluation.status === "GRADED"
                          ? "Đã chốt điểm"
                          : "Chờ duyệt"}
                      </Type>
                    </View>
                  </View>

                  <Type style={[s.h2, { marginTop: 8 }]}>Câu hỏi thi</Type>
                  <Type
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      color: "#1e293b",
                      marginVertical: 6,
                    }}
                  >
                    {selectedEvaluation.questionContent}
                  </Type>

                  <View style={s.rule} />

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      marginVertical: 8,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#f8fafc",
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <Type style={s.detailLabel}>ĐIỂM AI GỢI Ý</Type>
                      <Type
                        style={[s.h1, { color: palette.blue, marginTop: 4 }]}
                      >
                        {selectedEvaluation.aiSuggestedScore !== undefined
                          ? selectedEvaluation.aiSuggestedScore.toFixed(1)
                          : "—"}
                        <Type style={s.muted}>
                          {" "}
                          / {selectedEvaluation.maxScore ?? 10}
                        </Type>
                      </Type>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#f8fafc",
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <Type style={s.detailLabel}>ĐIỂM CHÍNH THỨC</Type>
                      <Type
                        style={[
                          s.h1,
                          {
                            color:
                              selectedEvaluation.finalScore !== undefined
                                ? "#10b981"
                                : "#64748b",
                            marginTop: 4,
                          },
                        ]}
                      >
                        {selectedEvaluation.finalScore !== undefined
                          ? selectedEvaluation.finalScore.toFixed(1)
                          : "Chờ duyệt"}
                        {selectedEvaluation.finalScore !== undefined && (
                          <Type style={s.muted}>
                            {" "}
                            / {selectedEvaluation.maxScore ?? 10}
                          </Type>
                        )}
                      </Type>
                    </View>
                  </View>

                  {selectedEvaluation.gradedByName ? (
                    <Type style={[s.detailLabel, { marginTop: 4 }]}>
                      Người đánh giá: {selectedEvaluation.gradedByName}
                    </Type>
                  ) : null}
                </Surface>

                {selectedEvaluation.criteria &&
                selectedEvaluation.criteria.length > 0 ? (
                  <Surface>
                    <Type style={s.eyebrow}>
                      TIÊU CHÍ ĐÁNH GIÁ ({selectedEvaluation.criteria.length})
                    </Type>
                    {selectedEvaluation.criteria.map((cr, idx) => (
                      <View
                        key={cr.criterionId || idx}
                        style={{
                          paddingVertical: 10,
                          borderBottomWidth:
                            idx ===
                            (selectedEvaluation.criteria?.length ?? 0) - 1
                              ? 0
                              : 1,
                          borderColor: "#f1f5f9",
                        }}
                      >
                        <View
                          style={[
                            s.row,
                            {
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            },
                          ]}
                        >
                          <Type
                            style={{
                              fontFamily: "JakartaBold",
                              flex: 1,
                              fontSize: 14,
                            }}
                          >
                            {cr.criterionName}
                          </Type>
                          <Type
                            style={{
                              color: palette.blue,
                              fontFamily: "JakartaBold",
                              fontSize: 14,
                              marginLeft: 8,
                            }}
                          >
                            {cr.finalScore ?? cr.aiScore ?? "—"}/{cr.maxScore}
                          </Type>
                        </View>
                        {cr.comment ? (
                          <Type style={[s.muted, { fontSize: 13, marginTop: 4 }]}>
                            {cr.comment}
                          </Type>
                        ) : null}
                      </View>
                    ))}
                  </Surface>
                ) : null}

                <Surface>
                  <Type style={s.eyebrow}>NHẬN XÉT TỔNG THỂ</Type>
                  <Type
                    style={{
                      fontSize: 14,
                      lineHeight: 22,
                      color: "#334155",
                      marginTop: 4,
                    }}
                  >
                    {selectedEvaluation.overallFeedback ||
                      "Chưa có nhận xét tổng thể."}
                  </Type>
                </Surface>
              </>
            ) : (
              <>
                <View style={s.section}>
                  <Type style={s.eyebrow}>KẾT QUẢ ĐÁNH GIÁ</Type>
                  <Type
                    accessibilityRole="header"
                    aria-level={1}
                    style={s.h1}
                  >
                    Điểm thi môn học
                  </Type>
                  <Type style={s.muted}>
                    Xem điểm gợi ý từ AI và điểm chốt theo từng câu hỏi của môn
                    phụ trách.
                  </Type>
                </View>

                {courses.length > 0 ? (
                  <View style={{ marginBottom: 12 }}>
                    <Type style={[s.detailLabel, { marginBottom: 6 }]}>
                      MÔN HỌC PHỤ TRÁCH:
                    </Type>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8 }}
                    >
                      {courses.map((c) => {
                        const active = selectedCourseId === c.id;
                        return (
                          <Pressable
                            key={c.id}
                            accessibilityRole="button"
                            onPress={() => setSelectedCourseId(c.id)}
                            style={[
                              styles.statusChip,
                              active && styles.statusChipActive,
                            ]}
                          >
                            <Type
                              style={[
                                styles.statusChipText,
                                active && styles.statusChipTextActive,
                              ]}
                            >
                              {c.courseCode} - {c.courseName}
                            </Type>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : (
                  <Empty
                    icon="score"
                    title="Chưa có môn học"
                    description="Bạn chưa được phân công phụ trách môn học nào."
                  />
                )}

                {selectedCourseId ? (
                  <>
                    <View style={styles.filters}>
                      {(
                        [
                          { id: "ALL", label: "Tất cả" },
                          { id: "PENDING_REVIEW", label: "Chờ duyệt" },
                          { id: "GRADED", label: "Đã chốt" },
                        ] as const
                      ).map((opt) => {
                        const active = evaluationFilter === opt.id;
                        return (
                          <Pressable
                            key={opt.id}
                            accessibilityRole="button"
                            onPress={() => setEvaluationFilter(opt.id)}
                            style={[
                              styles.filter,
                              active && styles.activeFilter,
                            ]}
                          >
                            <Type
                              style={{
                                color: active ? palette.blue : "#475569",
                                fontFamily: "JakartaBold",
                              }}
                            >
                              {opt.label}
                            </Type>
                          </Pressable>
                        );
                      })}
                    </View>

                    {evaluationsLoading ? (
                      <ActivityIndicator
                        size="large"
                        color={palette.blue}
                        style={{ marginVertical: 32 }}
                      />
                    ) : evaluationsError ? (
                      <Surface>
                        <Type style={{ color: "#ef4444", marginBottom: 8 }}>
                          {evaluationsError}
                        </Type>
                        <Action
                          secondary
                          label="Thử lại"
                          onPress={() => retry()}
                        />
                      </Surface>
                    ) : evaluations.length === 0 ? (
                      <Empty
                        icon="score"
                        title="Chưa có bài thi nào"
                        description={
                          evaluationFilter !== "ALL"
                            ? "Không có bài thi nào phù hợp với bộ lọc trạng thái."
                            : "Môn học này hiện chưa có bài thi nào được đánh giá điểm."
                        }
                      />
                    ) : (
                      evaluations.map((ev) => (
                        <Surface key={ev.id}>
                          <View
                            style={[
                              s.row,
                              {
                                justifyContent: "space-between",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <Type style={s.eyebrow}>
                              {ev.status === "GRADED"
                                ? "ĐÃ CHỐT ĐIỂM"
                                : "CHỜ DUYỆT"}
                            </Type>
                            <View
                              style={[
                                styles.status,
                                {
                                  backgroundColor:
                                    ev.status === "GRADED"
                                      ? "#ecfdf5"
                                      : "#fef3c7",
                                },
                              ]}
                            >
                              <Type
                                style={{
                                  color:
                                    ev.status === "GRADED"
                                      ? "#059669"
                                      : "#d97706",
                                  fontSize: 11,
                                  fontFamily: "JakartaBold",
                                }}
                              >
                                {ev.status === "GRADED"
                                  ? "Hoàn tất"
                                  : "Chờ duyệt"}
                              </Type>
                            </View>
                          </View>

                          <Type
                            numberOfLines={2}
                            style={{
                              fontFamily: "JakartaBold",
                              fontSize: 15,
                              color: "#0f172a",
                              marginVertical: 4,
                            }}
                          >
                            {ev.questionContent}
                          </Type>

                          <View
                            style={[
                              s.row,
                              { gap: 16, marginTop: 4, marginBottom: 8 },
                            ]}
                          >
                            <Type style={s.muted}>
                              AI gợi ý:{" "}
                              <Type
                                style={{
                                  color: palette.blue,
                                  fontFamily: "JakartaBold",
                                }}
                              >
                                {ev.aiSuggestedScore !== undefined
                                  ? ev.aiSuggestedScore.toFixed(1)
                                  : "—"}
                              </Type>
                            </Type>
                            <Type style={s.muted}>
                              Chính thức:{" "}
                              <Type
                                style={{
                                  color:
                                    ev.finalScore !== undefined
                                      ? "#10b981"
                                      : "#64748b",
                                  fontFamily: "JakartaBold",
                                }}
                              >
                                {ev.finalScore !== undefined
                                  ? ev.finalScore.toFixed(1)
                                  : "Chưa chốt"}
                              </Type>
                            </Type>
                          </View>

                          <Action
                            secondary
                            label="Xem chi tiết điểm"
                            icon="arrow"
                            onPress={() => setSelectedEvaluationId(ev.id)}
                          />
                        </Surface>
                      ))
                    )}
                  </>
                ) : null}
              </>
            )
          ) : (
            <>
              <View style={s.section}>
                <Type style={s.eyebrow}>TÀI KHOẢN</Type>
                <Type accessibilityRole="header" aria-level={1} style={s.h1}>
                  Hồ sơ
                </Type>
              </View>
              <Surface>
                <View style={s.row}>
                  <View style={styles.avatar}>
                    <Icon name="profile" size={30} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Type style={s.h2}>{user.fullName}</Type>
                    <Type style={s.muted}>Hồ sơ giảng viên</Type>
                  </View>
                </View>
                <View style={s.rule} />
                {[
                  ["Họ và tên", user.fullName],
                  ["Mã giảng viên", user.userCode],
                  ["Email", user.email],
                ].map(([label, value]) => (
                  <View style={s.section} key={label}>
                    <Type style={s.detailLabel}>{label}</Type>
                    <Type
                      accessibilityLabel={`${label}: ${value || "chưa có thông tin"}`}
                    >
                      {value || "—"}
                    </Type>
                  </View>
                ))}
              </Surface>
              {courses.length > 0 ? (
                <Surface>
                  <Type style={s.eyebrow}>
                    MÔN HỌC ĐƯỢC PHÂN CÔNG ({courses.length})
                  </Type>
                  {courses.map((c) => (
                    <View key={c.id} style={{ paddingVertical: 4 }}>
                      <Type style={{ fontFamily: "JakartaBold" }}>
                        {c.courseCode}
                      </Type>
                      <Type style={s.muted}>{c.courseName}</Type>
                    </View>
                  ))}
                </Surface>
              ) : null}
              <Surface>
                <View style={s.row}>
                  <Icon name="lock" />
                  <Type style={s.h2}>Bảo mật</Type>
                </View>
                <Action
                  secondary
                  label="Đổi mật khẩu"
                  icon="lock"
                  disabled={busy}
                  onPress={onChangePassword}
                />
                <Type style={s.detailLabel}>
                  Cập nhật mật khẩu cho tài khoản của bạn.
                </Type>
              </Surface>
              <Action
                secondary
                disabled={busy}
                label={busy ? "Đang đăng xuất…" : "Đăng xuất"}
                icon="exit"
                onPress={onExit}
              />
            </>
          )}
        </Reveal>
      </ScrollView>
      <View style={styles.connection}>
        <View
          style={[
            styles.dot,
            exams.length > 0 && { backgroundColor: "#10b981" },
          ]}
        />
        <Type style={s.detailLabel}>
          {exams.length > 0
            ? `Đã kết nối máy chủ (${exams.length} kỳ thi, ${slots.length} ca thi)`
            : "Đang kết nối dữ liệu kỳ thi…"}
        </Type>
      </View>
      <View style={styles.navOuter}>
        <View accessibilityRole="tablist" style={styles.nav}>
          {tabs.map((entry) => (
            <Pressable
              key={entry.id}
              accessibilityRole="tab"
              accessibilityLabel={entry.label}
              accessibilityState={{ selected: tab === entry.id }}
              aria-selected={tab === entry.id}
              onPress={() => selectTab(entry.id)}
              style={({ pressed }) => [
                styles.navItem,
                tab === entry.id && styles.navActive,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Icon
                name={entry.icon}
                color={tab === entry.id ? palette.blue : palette.muted}
                size={23}
              />
              <Type
                style={[
                  styles.navLabel,
                  { color: tab === entry.id ? palette.blue : palette.muted },
                ]}
              >
                {entry.label}
              </Type>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.canvas },
  brandRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  role: {
    backgroundColor: palette.soft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  loader: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  feedbackSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    borderWidth: 1,
    marginBottom: 16,
  },
  feedbackError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    marginBottom: 16,
  },
  examBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.soft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  filters: {
    flexDirection: "row",
    padding: 5,
    backgroundColor: "#edf2f8",
    borderRadius: 24,
    gap: 4,
    marginBottom: 16,
  },
  filter: {
    minHeight: 48,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "#fff",
    boxShadow: "0 3px 10px rgba(15,23,42,.035)",
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: palette.soft,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  connection: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.muted },
  navOuter: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
  nav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 30,
    gap: 4,
    boxShadow: "0 6px 24px rgba(15,23,42,.06)",
  },
  navItem: {
    flex: 1,
    minHeight: 64,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navActive: { backgroundColor: palette.soft },
  navLabel: { fontFamily: "JakartaBold", fontSize: 11, lineHeight: 18 },
  back: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    paddingRight: 16,
    marginBottom: 8,
  },
  status: {
    backgroundColor: palette.soft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  searchInput: {
    minHeight: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Jakarta",
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 16,
  },
  monitorCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  monitorTitle: {
    fontFamily: "JakartaBold",
    fontSize: 13,
    color: "#334155",
  },
  monitorRate: {
    fontFamily: "JakartaBold",
    fontSize: 13,
    color: palette.blue,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginVertical: 8,
    overflow: "hidden",
  },
  progressBarThumb: {
    height: "100%",
    backgroundColor: palette.blue,
    borderRadius: 3,
  },
  monitorStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  monitorStatBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontFamily: "JakartaBold",
    fontSize: 15,
    color: "#0f172a",
  },
  statLabel: {
    fontFamily: "Jakarta",
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  formInput: {
    minHeight: 44,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "Jakarta",
    fontSize: 14,
    color: "#0f172a",
    marginTop: 4,
  },
  statusChipsContainer: {
    marginBottom: 16,
  },
  statusChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  statusChipActive: {
    backgroundColor: palette.soft,
    borderColor: palette.blue,
  },
  statusChipText: {
    fontFamily: "JakartaBold",
    fontSize: 13,
    color: "#64748b",
  },
  statusChipTextActive: {
    color: palette.blue,
  },
  statusChipBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  statusChipBadgeActive: {
    backgroundColor: palette.blue,
  },
  statusChipBadgeText: {
    fontFamily: "JakartaBold",
    fontSize: 11,
    color: "#64748b",
  },
  statusChipBadgeTextActive: {
    color: "#fff",
  },
});
