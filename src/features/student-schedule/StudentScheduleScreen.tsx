import { useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";
import { Badge, Button, Notice, Page, State } from "../../components/ui";
import {
  day,
  DEMO_CODE,
  exams,
  labels,
  lookupSlot,
  time,
  type Scenario,
  type Slot,
} from "../schedule/model";
import { colors, ui } from "../../theme";
export function StudentScheduleScreen({
  slots,
  scenario,
  onReset,
}: {
  slots: Slot[];
  scenario: Scenario;
  onReset: () => void;
}) {
  const [code, setCode] = useState(""),
    [submitted, setSubmitted] = useState(false),
    [error, setError] = useState("");
  const slot = submitted ? lookupSlot(slots, code) : undefined;
  const submit = () => {
    Keyboard.dismiss();
    if (!code.trim()) {
      setError("Vui lòng nhập mã kỳ thi.");
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(true);
  };
  return (
    <Page>
      <Text style={ui.small}>KHÔNG GIAN SINH VIÊN</Text>
      <Text accessibilityRole="header" aria-level={1} style={ui.h1}>
        Lịch thi của bạn
      </Text>
      <Text style={ui.muted}>
        Xin chào Đức Anh. Tra cứu ca vấn đáp được phân công bằng mã kỳ thi.
      </Text>
      <View style={ui.hero}>
        <Text style={[ui.small, { color: "#c4d4ff" }]}>SINH VIÊN DEMO</Text>
        <Text style={[ui.h2, ui.white]}>Nguyễn Đức Anh</Text>
        <Text style={[ui.text, { color: "#d8e3ff" }]}>SE190163</Text>
      </View>
      <Notice>Dữ liệu demo · Lịch và trạng thái chỉ để xem thử.</Notice>
      <View style={ui.card}>
        <Text style={ui.h2}>Tra cứu kỳ thi</Text>
        <Text style={ui.muted}>Nhập mã UUID do giảng viên cung cấp.</Text>
        <Text style={ui.label}>Mã kỳ thi</Text>
        <TextInput
          accessibilityLabel="Mã kỳ thi"
          placeholder="Nhập mã kỳ thi"
          placeholderTextColor={colors.muted}
          value={code}
          onChangeText={(value) => {
            setCode(value);
            setSubmitted(false);
            setError("");
          }}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={120}
          returnKeyType="search"
          onSubmitEditing={submit}
          style={ui.input}
        />
        {error ? (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        ) : null}
        <Button label="Tra cứu ca thi" onPress={submit} />
        <Button
          secondary
          label="Dùng mã mẫu"
          onPress={() => {
            setCode(DEMO_CODE);
            setSubmitted(true);
            setError("");
            Keyboard.dismiss();
          }}
        />
      </View>
      {scenario !== "ready" ? (
        <State kind={scenario} onRetry={onReset} />
      ) : submitted && !slot ? (
        <View style={ui.card}>
          <Text accessibilityRole="header" style={ui.h2}>
            Không tìm thấy ca thi
          </Text>
          <Text style={ui.muted}>
            Mã kỳ thi chưa tồn tại trong demo hoặc bạn chưa được xếp ca. Kiểm
            tra lại mã hoặc chọn “Dùng mã mẫu”.
          </Text>
        </View>
      ) : slot ? (
        <View style={ui.card}>
          <View style={ui.spread}>
            <Text style={ui.small}>CA THI CÁ NHÂN</Text>
            <Badge label={labels[slot.status]} />
          </View>
          <Text accessibilityRole="header" style={ui.h2}>
            {exams.find((e) => e.id === slot.examId)?.title}
          </Text>
          <Text style={ui.muted}>INT2204 · Lập trình Java</Text>
          <View style={[ui.divider, { gap: 8 }]}>
            <Text style={ui.text}>{day(slot.scheduledStartTime)}</Text>
            <Text style={[ui.h1, { color: colors.blue }]}>
              {time(slot.scheduledStartTime)} – {time(slot.scheduledEndTime)}
            </Text>
            <Text style={ui.text}>
              Số thứ tự {String(slot.slotNumber).padStart(2, "0")} · Giờ Việt
              Nam (UTC+7)
            </Text>
          </View>
          <Notice>
            Có mặt trước ca thi 10 phút. Chuẩn bị micro, tai nghe và kết nối ổn
            định. Bản demo chưa hỗ trợ vào thi.
          </Notice>
        </View>
      ) : (
        <Text style={ui.small}>
          Chưa có mã? Chạm “Dùng mã mẫu” để xem ca thi minh họa.
        </Text>
      )}
    </Page>
  );
}
