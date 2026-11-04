import { useEffect } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import type { AuthUser } from "../auth/auth-model";
import { Icon } from "../../components/ui/Icon";
import { Brand } from "../../components/ui/Brand";
import { day, labels, time, type Slot } from "../schedule/model";
import { useStudentOverview } from "./use-student-overview";
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
  { id: "schedule", label: "Lịch thi", icon: "calendar" },
  { id: "grades", label: "Điểm", icon: "score" },
  { id: "profile", label: "Hồ sơ", icon: "profile" },
] as const;

export function StudentScheduleScreen({
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
    results,
    selectedGrade,
    expandedFeedback,
    toggleFeedback,
    gradesLoading,
    gradesError,
    retryGrades,
    filter,
    selected,
    item,
    visible,
    items,
    loading,
    refreshing,
    error,
    setSelected,
    setFilter,
    selectTab,
    refresh,
    retry,
  } = useStudentOverview(initialSlots, user.id, token);

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
          <Type style={s.eyebrow}>SINH VIÊN</Type>
        </View>
      </View>
      {tab === "grades" && (
        <View style={styles.gradesHeading}>
          <Type accessibilityRole="header" aria-level={1} style={styles.gradesTitle}>
            Điểm thi
          </Type>
          <Type style={styles.gradesSubtitle}>Tổng điểm đã công bố · Chạm để xem chi tiết</Type>
        </View>
      )}
      <ScrollView
        key={`${tab}-${selected}`}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, tab === "grades" && styles.gradesContent]}
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
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={palette.blue} size="large" />
              <Type style={s.muted}>Đang tải lịch thi cá nhân…</Type>
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
          ) : selected && item && tab !== "grades" ? (
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
                <Type style={s.eyebrow}>CHI TIẾT KỲ THI</Type>
                <Type accessibilityRole="header" aria-level={1} style={s.h1}>
                  {item.exam.title}
                </Type>
                <Type style={s.muted}>
                  {item.exam.courseCode} · {item.exam.courseName}
                </Type>
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
                <Type>Số thứ tự · STT {String(item.slot.slotNumber).padStart(2, "0")}</Type>
                <Type style={s.detailLabel}>Giờ Việt Nam · UTC+7</Type>
              </Surface>
              {item.accessCode ? (
                <Surface style={styles.accessCodeCard}>
                  <Type style={s.eyebrow}>MÃ TRUY CẬP PHÒNG THI</Type>
                  <Type
                    style={[
                      s.h1,
                      {
                        color: "#15803d",
                        letterSpacing: 2,
                        textAlign: "center",
                        fontSize: 24,
                      },
                    ]}
                  >
                    {item.accessCode}
                  </Type>
                  <Type style={[s.detailLabel, { textAlign: "center" }]}>
                    Sử dụng mã này khi bước vào phiên vấn đáp.
                  </Type>
                </Surface>
              ) : null}
              {item.questions && item.questions.length > 0 ? (
                <Surface>
                  <Type style={s.eyebrow}>
                    BỘ CÂU HỎI ĐƯỢC CẤP PHÁT ({item.questions.length})
                  </Type>
                  {item.questions.map((q, idx) => (
                    <View key={q.questionId} style={{ paddingVertical: 4 }}>
                      <Type style={{ fontFamily: "JakartaBold" }}>
                        Câu {q.order ?? idx + 1}
                      </Type>
                      <Type>{q.content}</Type>
                    </View>
                  ))}
                </Surface>
              ) : null}
              {item.released && (
                <Surface>
                  <Type style={s.eyebrow}>ĐIỂM ĐÃ CÔNG BỐ</Type>
                  <Type style={s.h1}>
                    {item.released.score.toFixed(1)}
                    <Type style={s.muted}> / 10</Type>
                  </Type>
                  {!!item.released.comment && (
                    <Type>{item.released.comment}</Type>
                  )}
                </Surface>
              )}
            </>
          ) : tab === "schedule" ? (
            <>
              <View style={s.section}>
                <Type style={s.eyebrow}>LỊCH CỦA BẠN</Type>
                <Type accessibilityRole="header" aria-level={1} style={s.h1}>
                  Lịch thi
                </Type>
                <Type style={s.muted}>Các ca thi được phân công.</Type>
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
                    <Type style={s.eyebrow}>{entry.exam.courseCode}</Type>
                    <Type style={s.h2}>{entry.exam.title}</Type>
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
                  title="Chưa có dữ liệu lịch thi"
                  description="Bạn chưa có ca thi nào được xếp lịch trong hệ thống."
                />
              )}
              <View style={styles.note}>
                <Icon name="clock" size={18} color={palette.muted} />
                <Type style={[s.detailLabel, { flex: 1 }]}>
                  Lịch thi hiển thị theo giờ Việt Nam (UTC+7). Kéo xuống để làm mới.
                </Type>
              </View>
            </>
          ) : tab === "grades" ? (
            <>
              {gradesLoading ? (
                <View style={styles.loader}>
                  <ActivityIndicator color={palette.blue} />
                  <Type style={s.muted}>Đang tải điểm đã công bố…</Type>
                </View>
              ) : gradesError ? (
                <Surface>
                  <Type accessibilityRole="alert">{gradesError}</Type>
                  <Action label="Thử lại" onPress={retryGrades} />
                </Surface>
              ) : selectedGrade ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Quay lại danh sách điểm"
                    onPress={() => setSelected("")}
                    style={styles.back}
                  >
                    <Icon name="back" />
                    <Type style={styles.feedbackToggleLabel}>Quay lại</Type>
                  </Pressable>
                  <View style={styles.gradeCard}>
                    <View style={styles.gradeCardHeading}>
                      <Type style={styles.courseCode}>{selectedGrade.exam.courseCode}</Type>
                      <Type accessibilityRole="header" style={styles.examTitle}>{selectedGrade.exam.title}</Type>
                      <Type style={styles.gradesSubtitle}>Tổng điểm đã công bố · {selectedGrade.total.toFixed(1)}</Type>
                    </View>
                    {selectedGrade.questions.map((result) => {
                      const key = `${selectedGrade.slot.attemptId}-${result.questionOrder}`;
                      const expanded = expandedFeedback === key;
                      return (
                        <View key={result.questionOrder} style={styles.questionResult}>
                          <View style={styles.resultRow}>
                            <Type style={styles.questionLabel}>Câu {result.questionOrder}</Type>
                            <View style={styles.scoreBadge}>
                              <Type style={styles.scoreValue}>{result.finalScore.toFixed(1)}</Type>
                              <Type style={styles.scoreUnit}>điểm</Type>
                            </View>
                          </View>
                          <Type style={styles.feedback} numberOfLines={expanded ? undefined : 3}>
                            {result.feedback?.trim() || "Chưa có nhận xét từ giảng viên."}
                          </Type>
                          {!!result.feedback?.trim() && (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`${expanded ? "Thu gọn" : "Xem đầy đủ"} nhận xét câu ${result.questionOrder}`}
                              accessibilityState={{ expanded }}
                              onPress={() => toggleFeedback(key)}
                              style={({ pressed }) => [styles.feedbackToggle, { opacity: pressed ? 0.6 : 1 }]}
                            >
                              <Type style={styles.feedbackToggleLabel}>{expanded ? "Thu gọn" : "Xem đầy đủ"}</Type>
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </>
              ) : results.length ? (
                results.map((entry) => (
                  <Pressable
                    key={entry.slot.attemptId}
                    accessibilityRole="button"
                    accessibilityLabel={`${entry.exam.courseCode}, ${entry.exam.title}, tổng điểm đã công bố ${entry.total.toFixed(1)}. Xem chi tiết`}
                    onPress={() => setSelected(entry.slot.attemptId)}
                    style={({ pressed }) => [styles.gradeCard, styles.gradeSummary, { opacity: pressed ? 0.65 : 1 }]}
                  >
                    <Type style={styles.summaryCourseCode}>{entry.exam.courseCode}</Type>
                    <View style={styles.summaryScore}>
                      <Type style={styles.scoreValue}>{entry.total.toFixed(1)}</Type>
                      <Icon name="arrow" size={18} color={palette.muted} />
                    </View>
                  </Pressable>
                ))
              ) : (
                <Empty
                  icon="score"
                  title="Chưa có dữ liệu điểm"
                  description="Chưa có điểm được công bố cho các ca thi đã hoàn tất. Kéo xuống để làm mới."
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
                    <Type style={s.muted}>Hồ sơ sinh viên</Type>
                  </View>
                </View>
                <View style={s.rule} />
                {[
                  ["Họ và tên", user.fullName],
                  ["Mã sinh viên", user.userCode],
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
      {tab !== "grades" && <View style={styles.connection}>
        <View
          style={[
            styles.dot,
            items.length > 0 && { backgroundColor: "#10b981" },
          ]}
        />
        <Type style={s.detailLabel}>
          {items.length > 0
            ? `Đã kết nối máy chủ (${items.length} ca thi)`
            : "Chưa có ca thi nào được phân công"}
        </Type>
      </View>
      }
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
  gradesHeading: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 4,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  gradesTitle: { fontFamily: "JakartaBold", fontSize: 26, lineHeight: 36, letterSpacing: -0.7 },
  gradesSubtitle: { fontSize: 13, lineHeight: 21, color: palette.muted },
  gradesContent: { paddingTop: 0, paddingHorizontal: 20 },
  gradeCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5eaf0",
    borderRadius: 18,
    paddingHorizontal: 18,
  },
  gradeCardHeading: { paddingTop: 16, paddingBottom: 14, gap: 3 },
  courseCode: { fontSize: 11, lineHeight: 18, color: palette.muted, letterSpacing: 0.4 },
  examTitle: { fontFamily: "JakartaBold", fontSize: 17, lineHeight: 25, letterSpacing: -0.3 },
  gradeSummary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, gap: 16, minHeight: 72 },
  summaryCourseCode: { flex: 1, fontFamily: "JakartaBold", fontSize: 14, lineHeight: 22 },
  summaryScore: { flexDirection: "row", alignItems: "center", gap: 12 },
  feedback: { fontSize: 13, lineHeight: 21, color: "#475569" },
  feedbackToggle: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingRight: 16 },
  feedbackToggleLabel: { fontSize: 12, lineHeight: 20, color: palette.blue },
  questionResult: { borderTopWidth: 1, borderTopColor: "#edf0f4", paddingVertical: 14, gap: 10 },
  resultRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  questionLabel: { fontFamily: "JakartaBold", fontSize: 13, lineHeight: 22 },
  scoreBadge: { flexDirection: "row", alignItems: "baseline", gap: 4, backgroundColor: palette.soft, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 4 },
  scoreValue: { fontFamily: "JakartaBold", fontSize: 20, lineHeight: 28, color: palette.blue, fontVariant: ["tabular-nums"] },
  scoreUnit: { fontSize: 11, lineHeight: 18, color: palette.blue },
  loader: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  accessCodeCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    borderWidth: 1,
  },
  filters: {
    flexDirection: "row",
    padding: 5,
    backgroundColor: "#edf2f8",
    borderRadius: 24,
    gap: 4,
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
});
