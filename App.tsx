import { useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { DemoEntryScreen } from "./src/features/auth/demo-entry/DemoEntryScreen";
import { StudentScheduleScreen } from "./src/features/student-schedule/StudentScheduleScreen";
import { LecturerScheduleScreen } from "./src/features/lecturer-schedule/LecturerScheduleScreen";
import { useDemoSchedule } from "./src/features/schedule/use-demo-schedule";
import type { Scenario } from "./src/features/schedule/model";
import { Button, Chip } from "./src/components/ui";
import { colors } from "./src/theme";
export default function App() {
  const [role, setRole] = useState<"student" | "lecturer" | null>(null),
    [scenario, setScenario] = useState<Scenario>("ready"),
    [tools, setTools] = useState(false);
  const schedule = useDemoSchedule();
  useEffect(() => {
    if (Platform.OS === "web" || role !== "student") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setRole(null);
      return true;
    });
    return () => sub.remove();
  }, [role]);
  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.lang = "vi";
      document.title = "AIVES · Lịch thi demo";
    }
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
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
                    onPress={() => {
                      setRole(null);
                      setScenario("ready");
                    }}
                  />
                  <Text style={{ fontWeight: "900", color: colors.blue }}>
                    ✦ AIVES
                  </Text>
                  <Button
                    secondary
                    label="Kịch bản"
                    onPress={() => setTools(!tools)}
                  />
                </View>
                {tools ? (
                  <View
                    style={{
                      padding: 12,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {(
                      [
                        ["ready", "Có dữ liệu"],
                        ["loading", "Đang tải"],
                        ["empty", "Trống"],
                        ["error", "Lỗi"],
                      ] as const
                    ).map(([key, label]) => (
                      <Chip
                        key={key}
                        label={label}
                        selected={scenario === key}
                        onPress={() => setScenario(key)}
                      />
                    ))}
                  </View>
                ) : null}
                {role === "student" ? (
                  <StudentScheduleScreen
                    slots={schedule.slots}
                    scenario={scenario}
                    onReset={() => setScenario("ready")}
                  />
                ) : (
                  <LecturerScheduleScreen
                    {...schedule}
                    onExit={() => {
                      setRole(null);
                      setScenario("ready");
                    }}
                    scenario={scenario}
                    onReset={() => setScenario("ready")}
                  />
                )}
              </>
            ) : (
              <DemoEntryScreen onSelect={setRole} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
