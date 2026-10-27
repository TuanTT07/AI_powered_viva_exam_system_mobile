import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { colors, ui } from "../../theme";
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: secondary ? colors.line : colors.blue,
        backgroundColor: secondary ? "#fff" : colors.blue,
        opacity: disabled ? 0.55 : pressed ? 0.78 : 1,
      })}
    >
      <Text
        style={{
          color: secondary ? colors.ink : "#fff",
          fontSize: 15,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 48,
        justifyContent: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: selected ? colors.navy : "#fff",
        borderWidth: 1,
        borderColor: selected ? colors.navy : colors.line,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: selected ? "#fff" : colors.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Badge({ label }: { label: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: colors.pale,
        borderRadius: 7,
        paddingHorizontal: 9,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#254392" }}>
        {label}
      </Text>
    </View>
  );
}
export function Page({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={ui.page}
      contentContainerStyle={ui.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <View style={ui.banner}>
      <Text accessibilityRole="text" style={[ui.small, { color: "#28477d" }]}>
        {children}
      </Text>
    </View>
  );
}
export function State({
  kind,
  onRetry,
}: {
  kind: "loading" | "empty" | "error";
  onRetry: () => void;
}) {
  return (
    <View style={[ui.card, { paddingVertical: 32 }]}>
      {kind === "loading" ? (
        <>
          <ActivityIndicator
            accessibilityLabel="Đang tải"
            color={colors.blue}
          />
          <Text style={ui.h3}>Đang tải lịch demo…</Text>
          <Button secondary label="Kết thúc mô phỏng tải" onPress={onRetry} />
        </>
      ) : (
        <>
          <Text style={ui.h3}>
            {kind === "empty" ? "Chưa có lịch thi" : "Không thể tải lịch thi"}
          </Text>
          <Text style={ui.muted}>
            {kind === "empty"
              ? "Lịch thi sẽ xuất hiện khi được phân công."
              : "Đây là lỗi kết nối mô phỏng. Thử lại để xem dữ liệu mẫu."}
          </Text>
          <Button
            label={kind === "empty" ? "Xem dữ liệu mẫu" : "Thử lại"}
            onPress={onRetry}
          />
        </>
      )}
    </View>
  );
}
