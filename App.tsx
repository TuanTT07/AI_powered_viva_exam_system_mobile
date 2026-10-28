import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthEntryScreen } from "./src/features/auth/AuthEntryScreen";
import { ChangePasswordScreen } from "./src/features/auth/ChangePasswordScreen";
import { useAuthSession } from "./src/features/auth/use-auth-session";
import { StudentScheduleScreen } from "./src/features/student-schedule/StudentScheduleScreen";
import { LecturerScheduleScreen } from "./src/features/lecturer-schedule/LecturerScheduleScreen";
import { useSchedule } from "./src/features/schedule/use-schedule";
import { Action, Surface, Type, palette, s } from "./src/components/ui/mobile";
import { Brand } from "./src/components/ui/Brand";
export default function App() {
  const auth = useAuthSession();
  const schedule = useSchedule();
  const [passwordRequested, setPasswordRequested] = useState(false);
  const passwordRequired = auth.session?.user.mustChangePassword === true;
  useEffect(() => {
    if (!auth.session) setPasswordRequested(false);
  }, [auth.session]);
  useEffect(() => {
    if (Platform.OS === "web" || (!passwordRequired && !passwordRequested))
      return;
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!passwordRequired && !auth.busy) setPasswordRequested(false);
      return true;
    });
    return () => listener.remove();
  }, [passwordRequired, passwordRequested, auth.busy]);
  const [fontsLoaded, fontError] = useFonts({
    Jakarta: PlusJakartaSans_500Medium,
    JakartaBold: PlusJakartaSans_700Bold,
  });
  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.lang = "vi";
      document.title = "AIVES";
    }
  }, []);
  if (!fontsLoaded)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        {fontError ? (
          <Text accessibilityRole="alert">
            Không thể tải phông chữ. Vui lòng mở lại ứng dụng.
          </Text>
        ) : (
          <ActivityIndicator
            accessibilityLabel="Đang mở AIVES"
            color="#2563eb"
          />
        )}
      </View>
    );
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
        }}
      >
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : Platform.OS === "web"
                ? "height"
                : undefined
          }
          style={{ flex: 1 }}
        >
          <View
            role="main"
            style={{
              flex: 1,
              maxWidth: 760,
              width: "100%",
              alignSelf: "center",
            }}
          >
            {auth.phase === "restoring" ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <ActivityIndicator
                  accessibilityLabel="Đang xác minh phiên đăng nhập"
                  color={palette.blue}
                />
                <Type style={s.muted}>Đang xác minh tài khoản…</Type>
              </View>
            ) : auth.phase === "error" ? (
              <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
                <Surface>
                  <Type accessibilityRole="header" style={s.h2}>
                    Chưa thể xác minh phiên
                  </Type>
                  <Type accessibilityRole="alert">{auth.error}</Type>
                  <Action label="Thử lại" onPress={() => void auth.restore()} />
                  <Action
                    secondary
                    label="Đăng nhập lại"
                    onPress={() => void auth.signOut()}
                  />
                </Surface>
              </View>
            ) : auth.session ? (
              <>
                {auth.error ? (
                  <Type
                    accessibilityRole="alert"
                    style={{ padding: 14, color: "#b42318" }}
                  >
                    {auth.error}
                  </Type>
                ) : null}
                {passwordRequired || passwordRequested ? (
                  <ChangePasswordScreen
                    required={passwordRequired}
                    busy={auth.busy}
                    onSubmit={auth.changePassword}
                    onBack={() => setPasswordRequested(false)}
                    onSignOut={() => void auth.signOut()}
                  />
                ) : auth.session.user.role === "student" ? (
                  <StudentScheduleScreen
                    key={auth.session.user.id}
                    slots={schedule.slots}
                    user={auth.session.user}
                    busy={auth.busy}
                    onChangePassword={() => setPasswordRequested(true)}
                    onExit={() => void auth.signOut()}
                  />
                ) : (
                  <>
                    <View style={{ padding: 20, gap: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <Brand />
                        <Action
                          secondary
                          label="Đăng xuất"
                          icon="exit"
                          disabled={auth.busy}
                          onPress={() => void auth.signOut()}
                        />
                      </View>
                      <Type style={s.h2}>{auth.session.user.fullName}</Type>
                      <Type style={s.muted}>{auth.session.user.email}</Type>
                      <Action
                        secondary
                        label="Đổi mật khẩu"
                        icon="lock"
                        onPress={() => setPasswordRequested(true)}
                      />
                    </View>
                    <LecturerScheduleScreen
                      key={auth.session.user.id}
                      {...schedule}
                      scenario="ready"
                      onReset={() => {}}
                      onExit={() => void auth.signOut()}
                    />
                  </>
                )}
              </>
            ) : (
              <AuthEntryScreen
                onSignIn={auth.signIn}
                pending={auth.busy}
                notice={auth.notice}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
