import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { mobilePalette } from "../../theme/mobile";

// Same sparkle motif as the web AIVES wordmark; rendered as vector on native.
export function Brand({ large = false }: { large?: boolean }) {
  const size = large ? 46 : 36;
  return (
    <View
      accessible
      accessibilityLabel="AIVES"
      style={{ flexDirection: "row", alignItems: "center", gap: 11 }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: large ? 16 : 12,
          backgroundColor: mobilePalette.blue,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 32 32"
          fill="none"
          stroke="#fff"
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          accessible={false}
        >
          <Path d="m13 6 2.6 7.4L23 16l-7.4 2.6L13 26l-2.6-7.4L3 16l7.4-2.6L13 6Zm12-4 1.3 4.7L31 8l-4.7 1.3L25 14l-1.3-4.7L19 8l4.7-1.3L25 2Z" />
        </Svg>
      </View>
      <Text
        style={{
          fontFamily: "JakartaBold",
          fontSize: large ? 25 : 20,
          color: mobilePalette.ink,
          letterSpacing: -0.8,
        }}
      >
        AIVES
      </Text>
    </View>
  );
}
