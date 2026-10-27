import { Text, View } from "react-native";
import { Badge, Button, Notice, Page } from "../../../components/ui";
import { colors, ui } from "../../../theme";
export function DemoEntryScreen({
  onSelect,
}: {
  onSelect: (role: "student" | "lecturer") => void;
}) {
  return (
    <Page>
      <View style={{ paddingTop: 24, gap: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "900", color: colors.blue }}>
          ✦ AIVES
        </Text>
        <Badge label="BẢN XEM THỬ · ANDROID" />
        <Text
          accessibilityRole="header"
          aria-level={1}
          style={[ui.h1, { fontSize: 36, lineHeight: 45 }]}
        >
          Lịch thi rõ ràng.{`\n`}Sẵn sàng vấn đáp.
        </Text>
        <Text style={ui.muted}>
          Tra cứu ca thi và sắp xếp thời gian của bạn, ngay trên điện thoại.
        </Text>
        <View style={ui.hero}>
          <Text style={[ui.small, { color: "#c4d4ff" }]}>
            AIVES / KHẢO THÍ VẤN ĐÁP
          </Text>
          <Text style={[ui.h2, ui.white]}>Một lịch thi, đúng vai trò.</Text>
          <Text style={[ui.text, { color: "#d8e3ff" }]}>
            Chọn không gian để trải nghiệm giao diện.
          </Text>
        </View>
        <View style={ui.card}>
          <Text style={ui.h2}>Bạn là ai?</Text>
          <Button label="Sinh viên →" onPress={() => onSelect("student")} />
          <Button
            secondary
            label="Giảng viên →"
            onPress={() => onSelect("lecturer")}
          />
        </View>
        <Notice>
          Dữ liệu demo · Không cần đăng nhập. Mọi thay đổi chỉ tồn tại trong
          phiên xem thử, chưa lưu lên hệ thống.
        </Notice>
        <Text style={[ui.small, { textAlign: "center" }]}>
          AIVES · Viva Exam System
        </Text>
      </View>
    </Page>
  );
}
