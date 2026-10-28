import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  View,
  type TextProps,
  type TextStyle,
} from "react-native";
import { Icon, type IconName } from "./Icon";
import { mobilePalette as palette } from "../../theme/mobile";
export { palette };
export function Type({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten([s.body, style]);
  // Native scales lineHeight with fontScale; web uses a relative line height for text-only resizing.
  const relativeLineHeight =
    Platform.OS === "web"
      ? ({
          lineHeight: String((flat?.lineHeight ?? 22) / (flat?.fontSize ?? 14)),
        } as unknown as TextStyle)
      : undefined;
  return <Text {...props} style={[s.body, style, relativeLineHeight]} />;
}
export function Surface({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[s.tray, style]}>
      <View style={s.core}>{children}</View>
    </View>
  );
}
export function Reveal({ children }: { children: ReactNode }) {
  const value = useRef(new Animated.Value(0)).current;
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (on) => live && setReduce(on),
    );
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduce,
    );
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (reduce === null) return;
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: reduce ? 0 : 380,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reduce, value]);
  return (
    <Animated.View
      style={{
        gap: 24,
        opacity: reduce === null ? 1 : value,
        transform: [
          {
            translateY: value.interpolate({
              inputRange: [0, 1],
              outputRange: [reduce ? 0 : 10, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
export function Action({
  label,
  onPress,
  icon = "arrow",
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.action,
        secondary && { backgroundColor: palette.soft },
        disabled && { opacity: 0.48 },
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <Type
        style={{
          flex: 1,
          color: secondary ? palette.blue : "#fff",
          fontFamily: "JakartaBold",
        }}
      >
        {label}
      </Type>
      <View style={[s.actionIcon, secondary && { backgroundColor: "#dbeafe" }]}>
        <Icon name={icon} color={secondary ? palette.blue : "#fff"} size={20} />
      </View>
    </Pressable>
  );
}
export function Empty({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <Surface>
      <View style={s.empty}>
        <View style={s.orbit}>
          <View style={s.orbitInner}>
            <Icon name={icon} size={34} />
          </View>
        </View>
        <Type accessibilityRole="header" style={s.h2}>
          {title}
        </Type>
        <Type style={s.emptyDescription}>{description}</Type>
      </View>
    </Surface>
  );
}
export const s = StyleSheet.create({
  body: {
    fontFamily: "Jakarta",
    fontSize: 14,
    lineHeight: 22,
    color: palette.ink,
  },
  h1: {
    fontFamily: "JakartaBold",
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: -1.1,
    color: palette.ink,
  },
  h2: {
    fontFamily: "JakartaBold",
    fontSize: 19,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  eyebrow: {
    fontFamily: "JakartaBold",
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 1.7,
    color: palette.blue,
  },
  muted: { color: palette.muted },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  tray: {
    padding: 5,
    borderRadius: 29,
    backgroundColor: palette.tray,
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.035)",
  },
  core: { borderRadius: 24, backgroundColor: "#fff", padding: 22, gap: 18 },
  action: {
    minHeight: 54,
    paddingLeft: 22,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 40,
    backgroundColor: palette.blue,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", paddingVertical: 24, gap: 12 },
  emptyDescription: {
    color: palette.muted,
    textAlign: "center",
    maxWidth: 260,
  },
  orbit: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#f8fafc",
    marginBottom: 10,
  },
  orbitInner: {
    backgroundColor: palette.soft,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { gap: 8 },
  detailLabel: { fontSize: 12, color: palette.muted },
  rule: { height: 1, backgroundColor: "#f1f5f9" },
});
