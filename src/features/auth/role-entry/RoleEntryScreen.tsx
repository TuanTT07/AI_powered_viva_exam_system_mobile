import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Brand } from "../../../components/ui/Brand";
import { Icon, type IconName } from "../../../components/ui/Icon";
import {
  palette,
  Reveal,
  s,
  Surface,
  Type,
} from "../../../components/ui/mobile";

export function RoleEntryScreen({
  onSelect,
}: {
  onSelect: (role: "student" | "lecturer") => void;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.canvas }}
      contentContainerStyle={styles.page}
    >
      <Brand large />
      <Reveal>
        <View style={styles.intro}>
          <Type accessibilityRole="header" aria-level={1} style={styles.title}>
            Lịch thi và{"\n"}
            <Type style={[styles.title, { color: palette.blue }]}>
              kết quả.
            </Type>
          </Type>
          <Type style={[s.muted, { maxWidth: 290 }]}>
            Theo dõi kỳ thi của bạn cùng AIVES.
          </Type>
        </View>
        <View style={{ gap: 14 }}>
          <Type style={s.eyebrow}>TIẾP TỤC VỚI</Type>
          <RoleCard
            title="Sinh viên"
            description="Lịch thi và điểm số"
            icon="profile"
            onPress={() => onSelect("student")}
          />
          <RoleCard
            title="Giảng viên"
            description="Kỳ thi và điểm danh"
            icon="calendar"
            onPress={() => onSelect("lecturer")}
          />
        </View>
      </Reveal>
      <Type style={styles.footer}>AIVES · Hệ thống khảo thí vấn đáp</Type>
    </ScrollView>
  );
}
function RoleCard({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
    >
      <Surface>
        <View style={styles.roleRow}>
          <View style={styles.icon}>
            <Icon name={icon} size={26} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Type style={s.h2}>{title}</Type>
            <Type style={s.muted}>{description}</Type>
          </View>
          <View style={styles.arrow}>
            <Icon name="arrow" size={19} />
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: 42,
  },
  intro: { paddingTop: 12, paddingBottom: 12, gap: 18 },
  title: {
    fontFamily: "JakartaBold",
    fontSize: 39,
    lineHeight: 50,
    letterSpacing: -1.5,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 60,
    flexWrap: "wrap",
  },
  icon: {
    width: 52,
    height: 52,
    backgroundColor: palette.soft,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    width: 32,
    height: 32,
    backgroundColor: palette.soft,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    color: palette.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: "auto",
    paddingTop: 8,
  },
});
