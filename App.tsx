import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RoleEntryScreen } from "./src/features/auth/role-entry/RoleEntryScreen";
import { StudentScheduleScreen } from "./src/features/student-schedule/StudentScheduleScreen";
import { LecturerScheduleScreen } from "./src/features/lecturer-schedule/LecturerScheduleScreen";
import { useSchedule } from "./src/features/schedule/use-schedule";
import { Button } from "./src/components/ui";
import { colors } from "./src/theme";
import { Brand } from "./src/components/ui/Brand";
export default function App() {
  const [role, setRole] = useState<"student" | "lecturer" | null>(null);
  const schedule = useSchedule();
  const [fontsLoaded, fontError] = useFonts({
    Jakarta: PlusJakartaSans_500Medium,
    JakartaBold: PlusJakartaSans_700Bold,
  });
  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.lang = "vi";
      document.title = "AIVES · Lịch thi";
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
          backgroundColor: role !== "lecturer" ? "#f8fafc" : colors.bg,
        }}
      >
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            {role ? (
              <>
                {role === "lecturer" && (
                  <View
                    style={{
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#fff",
                      borderBottomWidth: 1,
                      borderColor: colors.line,
                    }}
                  >
                    <Button
                      secondary
                      label="← Đổi vai trò"
                      onPress={() => setRole(null)}
                    />
                    <Brand />
                  </View>
                )}
                {role === "student" ? (
                  <StudentScheduleScreen
                    slots={schedule.slots}
                    onExit={() => setRole(null)}
                  />
                ) : (
                  <LecturerScheduleScreen
                    {...schedule}
                    onExit={() => setRole(null)}
                    scenario="ready"
                    onReset={() => {}}
                  />
                )}
              </>
            ) : (
              <RoleEntryScreen onSelect={setRole} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
