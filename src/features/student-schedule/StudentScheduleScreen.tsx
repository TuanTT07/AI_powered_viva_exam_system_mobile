import { useEffect } from "react";
import {
  BackHandler,
  Platform,
  Pressable,
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
  slots,
  onExit,
  user,
  onChangePassword,
  busy,
}: {
  slots: Slot[];
  onExit: () => void;
  user: AuthUser;
  onChangePassword: () => void;
  busy: boolean;
}) {
  const {
    tab,
    filter,
    selected,
    item,
    visible,
    items,
    setSelected,
    setFilter,
    selectTab,
  } = useStudentOverview(slots, user.id);
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
  const results = items.filter((entry) => entry.released);
  return (
    <View style={styles.root}>
      <View style={styles.brandRow}>
        <Brand />
        <View style={styles.role}>
          <Type style={s.eyebrow}>SINH VIÊN</Type>
        </View>
      </View>
      <ScrollView
        key={`${tab}-${selected}`}
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Reveal>
          {selected && item ? (
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
                    {labels[item.slot.status]}
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
                <Type>Số thứ tự · {item.slot.slotNumber}</Type>
                <Type style={s.detailLabel}>Giờ Việt Nam · UTC+7</Type>
              </Surface>
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
                    <Type style={s.muted}>{labels[entry.slot.status]}</Type>
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
                  description="Lịch thi sẽ hiển thị khi ứng dụng kết nối hệ thống."
                />
              )}
              <View style={styles.note}>
                <Icon name="clock" size={18} color={palette.muted} />
                <Type style={[s.detailLabel, { flex: 1 }]}>
                  Lịch thi hiển thị theo giờ Việt Nam (UTC+7).
                </Type>
              </View>
            </>
          ) : tab === "grades" ? (
            <>
              <View style={s.section}>
                <Type style={s.eyebrow}>KẾT QUẢ HỌC TẬP</Type>
                <Type accessibilityRole="header" aria-level={1} style={s.h1}>
                  Điểm thi
                </Type>
                <Type style={s.muted}>Kết quả đã được công bố.</Type>
              </View>
              {results.length ? (
                results.map((entry) => (
                  <Surface key={entry.slot.attemptId}>
                    <Type style={s.eyebrow}>{entry.exam.courseCode}</Type>
                    <Type style={s.h2}>{entry.exam.title}</Type>
                    <Type style={[s.h1, { color: palette.blue }]}>
                      {entry.released!.score.toFixed(1)}
                      <Type style={s.muted}> / 10</Type>
                    </Type>
                    <Action
                      secondary
                      label="Xem kết quả"
                      onPress={() => setSelected(entry.slot.attemptId)}
                    />
                  </Surface>
                ))
              ) : (
                <Empty
                  icon="score"
                  title="Chưa có dữ liệu điểm"
                  description="Điểm đã công bố sẽ xuất hiện tại đây khi kết nối hệ thống."
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
      <View style={styles.connection}>
        <View style={styles.dot} />
        <Type style={s.detailLabel}>Chưa kết nối dữ liệu kỳ thi</Type>
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
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.muted },
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
  },
  status: {
    backgroundColor: palette.soft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
});
