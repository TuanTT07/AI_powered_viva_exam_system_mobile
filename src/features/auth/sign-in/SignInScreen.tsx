import { useRef, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Brand } from "../../../components/ui/Brand";
import { Icon } from "../../../components/ui/Icon";
import {
  Action,
  palette,
  Reveal,
  s,
  Surface,
  Type,
} from "../../../components/ui/mobile";
import type { Credentials } from "../auth-model";
import { useSignIn } from "./use-sign-in";

export function SignInScreen({
  onBack,
  onSignIn,
  pending,
  notice,
}: {
  onBack: () => void;
  onSignIn: (credentials: Credentials) => Promise<void>;
  pending: boolean;
  notice: string;
}) {
  const form = useSignIn(onSignIn, pending);
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      style={{ flex: 1, backgroundColor: palette.canvas }}
      contentContainerStyle={styles.page}
    >
      <View style={styles.header}>
        <Pressable
          disabled={pending}
          accessibilityState={{ disabled: pending }}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại màn chào"
          style={styles.back}
        >
          <Icon name="back" />
        </Pressable>
        <Brand />
      </View>
      <Reveal>
        <View style={s.section}>
          <Type accessibilityRole="header" aria-level={1} style={s.h1}>
            Đăng nhập
          </Type>
          <Type style={s.muted}>Sử dụng tài khoản được nhà trường cấp.</Type>
        </View>
        {notice ? (
          <Type
            accessibilityLiveRegion="polite"
            style={{ color: palette.blue }}
          >
            {notice}
          </Type>
        ) : null}
        <Surface>
          <View style={s.section}>
            <Type nativeID="email-label" style={styles.label}>
              Email
            </Type>
            <TextInput
              editable={!pending}
              accessibilityLabel="Email"
              aria-labelledby="email-label"
              aria-invalid={!!form.errors.email}
              aria-describedby={form.errors.email ? "email-error" : undefined}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={254}
              autoComplete="email"
              textContentType="username"
              keyboardType="email-address"
              returnKeyType="next"
              placeholder="Nhập email của bạn"
              placeholderTextColor={palette.muted}
              value={form.email}
              onChangeText={form.setEmail}
              onSubmitEditing={() => passwordInput.current?.focus()}
              style={[styles.input, !!form.errors.email && styles.invalid]}
            />
            {form.errors.email && (
              <Type
                nativeID="email-error"
                accessibilityRole="alert"
                style={styles.error}
              >
                {form.errors.email}
              </Type>
            )}
          </View>
          <View style={s.section}>
            <Type nativeID="password-label" style={styles.label}>
              Mật khẩu
            </Type>
            <View
              style={[
                styles.passwordShell,
                !!form.errors.password && styles.invalid,
              ]}
            >
              <TextInput
                editable={!pending}
                ref={passwordInput}
                accessibilityLabel="Mật khẩu"
                aria-labelledby="password-label"
                aria-invalid={!!form.errors.password}
                aria-describedby={
                  form.errors.password ? "password-error" : undefined
                }
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                secureTextEntry={!form.showPassword}
                returnKeyType="go"
                placeholder="Nhập mật khẩu"
                placeholderTextColor={palette.muted}
                value={form.password}
                onChangeText={form.setPassword}
                onSubmitEditing={form.submit}
                style={[styles.passwordInput]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  form.showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
                disabled={pending}
                aria-pressed={form.showPassword}
                accessibilityState={{ selected: form.showPassword }}
                onPress={() => form.setShowPassword(!form.showPassword)}
                style={styles.reveal}
              >
                <Type style={styles.revealText}>
                  {form.showPassword ? "Ẩn" : "Hiện"}
                </Type>
              </Pressable>
            </View>
            {form.errors.password && (
              <Type
                nativeID="password-error"
                accessibilityRole="alert"
                style={styles.error}
              >
                {form.errors.password}
              </Type>
            )}
          </View>
          {form.message ? (
            <View style={styles.message}>
              <Type accessibilityRole="alert" style={{ color: "#9f2d26" }}>
                {form.message}
              </Type>
            </View>
          ) : null}
          <Action
            label={pending ? "Đang đăng nhập…" : "Đăng nhập"}
            disabled={pending}
            onPress={form.submit}
          />
          {pending ? (
            <ActivityIndicator
              accessibilityLabel="Đang xác thực tài khoản"
              color={palette.blue}
            />
          ) : null}
        </Surface>
        <View style={styles.help}>
          <Icon name="lock" size={19} color={palette.muted} />
          <Type style={[s.detailLabel, { flex: 1 }]}>
            Quên mật khẩu? Liên hệ quản trị viên nhà trường để được hỗ trợ.
          </Type>
        </View>
      </Reveal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  back: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontFamily: "JakartaBold", fontSize: 13 },
  input: {
    minHeight: 56,
    backgroundColor: palette.canvas,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: "Jakarta",
    fontSize: 16,
    color: palette.ink,
  },
  passwordShell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.canvas,
    borderRadius: 16,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: "Jakarta",
    fontSize: 16,
    color: palette.ink,
  },
  reveal: {
    minWidth: 52,
    minHeight: 52,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  revealText: { color: palette.blue, fontFamily: "JakartaBold", fontSize: 12 },
  invalid: { backgroundColor: "#fff1f2" },
  error: { color: "#b42318", fontSize: 12 },
  message: { padding: 14, borderRadius: 16, backgroundColor: "#fff1f2" },
  help: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 10,
  },
});
