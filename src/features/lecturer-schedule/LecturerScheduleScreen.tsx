import { useEffect } from "react";
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
import { day, labels, time, type Slot } from "../schedule/model";
import { useLecturerOverview } from "./use-lecturer-overview";
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
  { id: "roster", label: "Danh sách thi", icon: "score" },
  { id: "profile", label: "Hồ sơ", icon: "profile" },
] as const;

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
    item,
    visible,
    items,
    roster,
    setSelected,
    setFilter,
    setSearchQuery,
    selectTab,
    refresh,
    retry,
    markAbsent,
    resetAttempt,
    clearFeedback,
  } = useLecturerOverview(initialSlots, token);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selected) setSelected("");
      else if (tab !== "schedule") selectTab("schedule");
      else return false;
      return true;
    });
    return () => sub.remove();
  }, [selected, tab, onExit, setSelected, selectTab]);

  return (
    <View style={styles.root}>
      <View style={styles.brandRow}>
        <Brand />
        <View style={styles.role}>
          <Type style={s.eyebrow}>GIẢNG VIÊN</Type>
        </View>
      </View>
      <ScrollView
        key={`${tab}-${selected}`}
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
                onPress={() => setSelected("")}
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
                    Đánh dấu thí sinh vắng mặt nếu không tham gia ca thi.
                  </Type>
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
                        <Type style={s.detailLabel}>
                          {examSlots.length > 0
                            ? `${examSlots.length} ca thi đã được xếp lịch`
                            : "Kỳ thi chưa có ca thi nào được xếp lịch"}
                        </Type>
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
                  {roster.length ? (
                    roster.map((entry) => (
                      <Surface key={entry.slot.attemptId}>
                        <Type style={s.eyebrow}>
                          STT {String(entry.slot.slotNumber).padStart(2, "0")}
                        </Type>
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
                      description="Thử tìm kiếm với từ khóa khác."
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
});
