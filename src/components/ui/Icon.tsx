import Svg, { Path, Rect, Circle } from "react-native-svg";
export type IconName =
  | "calendar"
  | "score"
  | "profile"
  | "arrow"
  | "back"
  | "clock"
  | "lock"
  | "exit";
export function Icon({
  name,
  color = "#2563eb",
  size = 24,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {name === "calendar" && (
        <>
          <Rect x="3" y="5" width="18" height="16" rx="4" />
          <Path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2m-8 3h2" />
        </>
      )}
      {name === "score" && (
        <>
          <Rect x="4" y="3" width="16" height="18" rx="4" />
          <Path d="m8 10 2 2 5-5M8 16h8" />
        </>
      )}
      {name === "profile" && (
        <>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </>
      )}
      {name === "arrow" && <Path d="M5 12h14m-5-5 5 5-5 5" />}
      {name === "back" && <Path d="M19 12H5m5-5-5 5 5 5" />}
      {name === "clock" && (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 7v5l3 2" />
        </>
      )}
      {name === "lock" && (
        <>
          <Rect x="5" y="10" width="14" height="11" rx="3" />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
        </>
      )}
      {name === "exit" && (
        <Path d="M10 4H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h4m-1-8h12m-4-4 4 4-4 4" />
      )}
    </Svg>
  );
}
