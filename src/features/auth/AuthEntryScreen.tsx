import { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import type { Credentials } from "./auth-model";
import { SignInScreen } from "./sign-in/SignInScreen";
import { WelcomeScreen } from "./welcome/WelcomeScreen";

export function AuthEntryScreen({
  onSignIn,
  pending,
  notice,
}: {
  onSignIn: (credentials: Credentials) => Promise<void>;
  pending: boolean;
  notice: string;
}) {
  const [page, setPage] = useState<"welcome" | "sign-in">(
    notice ? "sign-in" : "welcome",
  );
  useEffect(() => {
    if (Platform.OS === "web" || page !== "sign-in") return;
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!pending) setPage("welcome");
      return true;
    });
    return () => back.remove();
  }, [page, pending]);
  return page === "welcome" ? (
    <WelcomeScreen onSignIn={() => setPage("sign-in")} />
  ) : (
    <SignInScreen
      onBack={() => setPage("welcome")}
      onSignIn={onSignIn}
      pending={pending}
      notice={notice}
    />
  );
}
