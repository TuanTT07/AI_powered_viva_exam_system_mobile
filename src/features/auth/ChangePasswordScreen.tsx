import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ApiError } from "../../services/api/client";
import { Action, palette, s, Surface, Type } from "../../components/ui/mobile";

export function ChangePasswordScreen({
  required,
  busy,
  onSubmit,
  onBack,
  onSignOut,
}: {
  required: boolean;
  busy: boolean;
  onSubmit: (values: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  onBack: () => void;
  onSignOut: () => void;
}) {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const nextRef = useRef<ComponentRef<typeof TextInput>>(null);
  const confirmationRef = useRef<ComponentRef<typeof TextInput>>(null);
  async function submit() {
    if (busy) return;
    if (
      !currentPassword ||
      newPassword.length < 6 ||
      newPassword.length > 100 ||
      !newPassword.trim()
    ) {
      setMessage("Nhập mật khẩu hiện tại và mật khẩu mới từ 6 đến 100 ký tự.");
      return;
    }
    if (newPassword !== confirmation) {
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    if (newPassword === currentPassword) {
      setMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }
    setMessage("");
    try {
      await onSubmit({ currentPassword, newPassword });
    } catch (failure) {
      setMessage(
        failure instanceof ApiError
          ? failure.message
          : "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    }
  }
  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.page}
    >
      {!required && (
        <Action
          secondary
          label="Quay lại"
          icon="back"
          disabled={busy}
          onPress={onBack}
        />
      )}
      <View style={s.section}>
        <Type accessibilityRole="header" aria-level={1} style={s.h1}>
          Đổi mật khẩu
        </Type>
        <Type style={s.muted}>
          {required
            ? "Bạn cần đổi mật khẩu khởi tạo trước khi tiếp tục."
            : "Dùng mật khẩu riêng để bảo vệ tài khoản."}
        </Type>
      </View>
      <Surface>
        <View style={s.section}>
          <Type style={styles.label}>Mật khẩu hiện tại</Type>
          <TextInput
            accessibilityLabel="Mật khẩu hiện tại"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            editable={!busy}
            value={currentPassword}
            onChangeText={setCurrent}
            returnKeyType="next"
            onSubmitEditing={() => nextRef.current?.focus()}
            style={styles.input}
          />
        </View>
        <View style={s.section}>
          <Type style={styles.label}>Mật khẩu mới</Type>
          <TextInput
            ref={nextRef}
            accessibilityLabel="Mật khẩu mới"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!busy}
            maxLength={100}
            value={newPassword}
            onChangeText={setNew}
            returnKeyType="next"
            onSubmitEditing={() => confirmationRef.current?.focus()}
            style={styles.input}
          />
          <Type style={s.detailLabel}>Từ 6 đến 100 ký tự.</Type>
        </View>
        <View style={s.section}>
          <Type style={styles.label}>Xác nhận mật khẩu mới</Type>
          <TextInput
            ref={confirmationRef}
            accessibilityLabel="Xác nhận mật khẩu mới"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!busy}
            maxLength={100}
            value={confirmation}
            onChangeText={setConfirmation}
            returnKeyType="go"
            onSubmitEditing={submit}
            style={styles.input}
          />
        </View>
        {message ? (
          <Type accessibilityRole="alert" style={{ color: "#b42318" }}>
            {message}
          </Type>
        ) : null}
        <Action
          label={busy ? "Đang cập nhật…" : "Lưu mật khẩu"}
          disabled={busy}
          onPress={submit}
        />
        {busy && (
          <ActivityIndicator
            accessibilityLabel="Đang đổi mật khẩu"
            color={palette.blue}
          />
        )}
      </Surface>
      {required && (
        <Action
          secondary
          label="Đăng xuất"
          icon="exit"
          disabled={busy}
          onPress={onSignOut}
        />
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  label: { fontFamily: "JakartaBold", fontSize: 13 },
  input: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: palette.canvas,
    color: palette.ink,
    fontFamily: "Jakarta",
    fontSize: 16,
  },
});
