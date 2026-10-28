import { ScrollView, StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Brand } from "../../../components/ui/Brand";
import {
  Action,
  palette,
  Reveal,
  s,
  Type,
} from "../../../components/ui/mobile";

export function WelcomeScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.canvas }}
      contentContainerStyle={styles.page}
    >
      <Brand large />
      <View style={styles.main}>
        <Reveal>
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Svg
              width="100%"
              height={220}
              viewBox="0 0 320 220"
              fill="none"
              accessible={false}
            >
              <Rect
                x="14"
                y="36"
                width="292"
                height="170"
                rx="44"
                fill="#eff6ff"
              />
              <Rect
                x="44"
                y="14"
                width="224"
                height="182"
                rx="34"
                fill="#e1ebfa"
              />
              <Rect
                x="49"
                y="19"
                width="214"
                height="172"
                rx="29"
                fill="white"
              />
              <Rect
                x="91"
                y="51"
                width="130"
                height="108"
                rx="22"
                stroke="#2563eb"
                strokeWidth="2"
              />
              <Path
                d="M91 82h130m-99-44v26m68-26v26m-69 38h12m30 0h12m-54 24h12"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Circle cx="254" cy="158" r="38" fill="#dbeafe" />
              <Circle cx="254" cy="158" r="31" fill="#2563eb" />
              <Path
                d="m241 158 9 9 17-18"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="37" cy="95" r="8" fill="#bfdbfe" />
              <Path
                d="m281 17 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z"
                stroke="#2563eb"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
          <View style={styles.copy}>
            <Type
              accessibilityRole="header"
              aria-level={1}
              style={styles.title}
            >
              Lịch thi và{"\n"}
              <Type style={[styles.title, { color: palette.blue }]}>
                kết quả của bạn.
              </Type>
            </Type>
            <Type style={[s.muted, styles.description]}>
              Theo dõi lịch thi, xem điểm và quản lý hồ sơ trên AIVES.
            </Type>
          </View>
        </Reveal>
      </View>
      <View style={styles.bottom}>
        <Action label="Đăng nhập" onPress={onSignIn} />
        <Type style={styles.footer}>Dành cho sinh viên và giảng viên</Type>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 28,
  },
  main: { flexGrow: 1, justifyContent: "center", paddingVertical: 12 },
  copy: { gap: 16 },
  title: {
    fontFamily: "JakartaBold",
    fontSize: 34,
    lineHeight: 44,
    letterSpacing: -1.2,
  },
  description: { maxWidth: 310, fontSize: 15, lineHeight: 24 },
  bottom: { gap: 16, paddingTop: 8 },
  footer: { textAlign: "center", color: palette.muted, fontSize: 12 },
});
