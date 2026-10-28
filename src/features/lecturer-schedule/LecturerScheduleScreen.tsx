import { useEffect, useState } from "react";
import {
  BackHandler,
  Keyboard,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { Badge, Button, Chip, Notice, Page, State } from "../../components/ui";
import {
  dateKey,
  day,
  exams,
  filterSlots,
  labels,
  reschedule,
  time,
  type Scenario,
  type Slot,
} from "../schedule/model";
import { colors, ui } from "../../theme";
export function LecturerScheduleScreen({
  slots,
  scenario,
  onReset,
  changeSlot,
  onExit,
}: {
  slots: Slot[];
  scenario: Scenario;
  onReset: () => void;
  onExit: () => void;
  changeSlot: (id: string, date: string, start: string, end: string) => void;
}) {
  const [examId, setExamId] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [dateFilter, setDateFilter] = useState(""),
    [selected, setSelected] = useState(""),
    [editing, setEditing] = useState(false),
    [confirm, setConfirm] = useState(false),
    [date, setDate] = useState(""),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [error, setError] = useState(""),
    [feedback, setFeedback] = useState("");
  const slot = slots.find((s) => s.attemptId === selected),
    exam = exams.find((e) => e.id === examId);
  const back = () => {
    if (confirm) setConfirm(false);
    else if (editing) setEditing(false);
    else if (selected) setSelected("");
    else setExamId("");
    setError("");
  };
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (examId) back();
      else onExit();
      return true;
    });
    return () => sub.remove();
  });
  const rows = filterSlots(slots, examId, query, status, dateFilter);
  const dates = [
    ...new Set(
      slots
        .filter((s) => s.examId === examId)
        .map((s) => dateKey(s.scheduledStartTime)),
    ),
  ].sort();
  function review() {
    try {
      reschedule(slots, selected, date, start, end);
      Keyboard.dismiss();
      setError("");
      setConfirm(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Page key={`${examId}-${selected}-${editing}-${confirm}`}>
      {examId ? <Button secondary label="← Quay lại" onPress={back} /> : null}
      <Text accessibilityRole="header" aria-level={1} style={ui.h1}>
        {editing
          ? confirm
            ? "Xác nhận đổi ca"
            : "Đổi lịch ca thi"
          : slot
            ? "Chi tiết ca thi"
            : exam
              ? "Lịch thí sinh"
              : "Kỳ thi phụ trách"}
      </Text>
      {feedback ? (
        <View style={[ui.banner, { backgroundColor: "#e4f6ef" }]}>
          <Text
            accessibilityLiveRegion="polite"
            style={[ui.text, { color: colors.green }]}
          >
            {feedback}
          </Text>
          <Button
            secondary
            label="Đóng thông báo"
            onPress={() => setFeedback("")}
          />
        </View>
      ) : null}
      {scenario !== "ready" ? (
        <State kind={scenario} onRetry={onReset} />
      ) : editing && slot ? (
        <View style={ui.card}>
          <Text style={ui.h2}>{slot.studentName}</Text>
          <Text style={ui.muted}>
            {slot.studentCode} · Số thứ tự {slot.slotNumber}
          </Text>
          <Text style={ui.small}>
            Hiện tại: {dateKey(slot.scheduledStartTime)} ·{" "}
            {time(slot.scheduledStartTime)} – {time(slot.scheduledEndTime)}
          </Text>
          {confirm ? (
            <>
              <Text style={ui.h2}>Khung giờ mới</Text>
              <Text style={ui.text}>
                {date} · {start} – {end} (UTC+7)
              </Text>
              <Notice>Xác nhận đổi thời gian ca thi.</Notice>
              <Button
                label="Xác nhận đổi ca"
                onPress={() => {
                  try {
                    changeSlot(selected, date, start, end);
                    setFeedback(
                      `Đã đổi ca: ${slot.studentName} · ${start} – ${end}.`,
                    );
                    setEditing(false);
                    setConfirm(false);
                    setSelected("");
                    setDateFilter("");
                  } catch (e) {
                    setError((e as Error).message);
                    setConfirm(false);
                  }
                }}
              />
              <Button
                secondary
                label="Sửa lại"
                onPress={() => setConfirm(false)}
              />
            </>
          ) : (
            <>
              <Text style={ui.label}>Ngày thi (YYYY-MM-DD)</Text>
              <TextInput
                accessibilityLabel="Ngày thi"
                style={ui.input}
                value={date}
                onChangeText={setDate}
                maxLength={10}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
              />
              <Text style={ui.label}>Giờ bắt đầu (HH:mm)</Text>
              <TextInput
                accessibilityLabel="Giờ bắt đầu"
                style={ui.input}
                value={start}
                onChangeText={setStart}
                maxLength={5}
                placeholder="HH:mm"
                placeholderTextColor={colors.muted}
              />
              <Text style={ui.label}>Giờ kết thúc (HH:mm)</Text>
              <TextInput
                accessibilityLabel="Giờ kết thúc"
                style={ui.input}
                value={end}
                onChangeText={setEnd}
                maxLength={5}
                placeholder="HH:mm"
                placeholderTextColor={colors.muted}
              />
              <Text style={ui.small}>
                Giờ Việt Nam (UTC+7).
              </Text>
              <Button label="Xem lại thay đổi" onPress={review} />
              <Button
                secondary
                label="Hủy đổi ca"
                onPress={() => {
                  setEditing(false);
                  setError("");
                }}
              />
            </>
          )}
          {error ? (
            <Text accessibilityRole="alert" style={ui.error}>
              {error}
            </Text>
          ) : null}
        </View>
      ) : slot ? (
        <View style={ui.card}>
          <Badge label={labels[slot.status]} />
          <Text style={ui.h2}>{slot.studentName}</Text>
          <Text style={ui.muted}>
            {slot.studentCode} · Số thứ tự {slot.slotNumber}
          </Text>
          <Text style={ui.text}>{day(slot.scheduledStartTime)}</Text>
          <Text style={[ui.h1, { color: colors.blue }]}>
            {time(slot.scheduledStartTime)} – {time(slot.scheduledEndTime)}
          </Text>
          <Text style={ui.small}>Giờ Việt Nam (UTC+7)</Text>
          {slot.status === "SCHEDULED" ? (
            <Button
              label="Đổi ca thi"
              onPress={() => {
                setDate(dateKey(slot.scheduledStartTime));
                setStart(time(slot.scheduledStartTime));
                setEnd(time(slot.scheduledEndTime));
                setEditing(true);
                setConfirm(false);
                setError("");
              }}
            />
          ) : (
            <Notice>Ca đã hủy hoặc đã bắt đầu không thể đổi lịch.</Notice>
          )}
        </View>
      ) : exam ? (
        <>
          <View style={ui.hero}>
            <Badge label={exam.courseCode} />
            <Text style={[ui.h2, ui.white]}>{exam.title}</Text>
            <Text style={[ui.text, { color: "#d8e3ff" }]}>
              {day(exam.startTime)}
            </Text>
          </View>
          <Text style={ui.label}>Tìm thí sinh</Text>
          <TextInput
            accessibilityLabel="Tìm thí sinh"
            style={ui.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Tên hoặc mã sinh viên"
            placeholderTextColor={colors.muted}
            maxLength={200}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              ["", "Tất cả"],
              ["SCHEDULED", "Đã xếp lịch"],
              ["CANCELLED", "Đã hủy"],
            ].map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                selected={status === key}
                onPress={() => setStatus(key)}
              />
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Chip
              label="Tất cả ngày"
              selected={!dateFilter}
              onPress={() => setDateFilter("")}
            />
            {dates.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={dateFilter === d}
                onPress={() => setDateFilter(d)}
              />
            ))}
          </View>
          <Text style={ui.small}>
            {rows.length} ca thi · Sắp xếp theo giờ bắt đầu
          </Text>
          {!rows.length ? (
            <View style={ui.card}>
              <Text style={ui.h3}>Không có ca thi phù hợp</Text>
              <Button
                secondary
                label="Xóa bộ lọc"
                onPress={() => {
                  setQuery("");
                  setStatus("");
                  setDateFilter("");
                }}
              />
            </View>
          ) : (
            rows.map((s) => (
              <View key={s.attemptId} style={ui.card}>
                <View style={ui.spread}>
                  <Text style={[ui.h2, { color: colors.blue }]}>
                    {time(s.scheduledStartTime)}
                  </Text>
                  <Badge label={labels[s.status]} />
                </View>
                <Text style={ui.small}>
                  đến {time(s.scheduledEndTime)} ·{" "}
                  {dateKey(s.scheduledStartTime)}
                </Text>
                <Text style={ui.h3}>{s.studentName}</Text>
                <Text style={ui.muted}>
                  {s.studentCode} · STT {String(s.slotNumber).padStart(2, "0")}
                </Text>
                <Button
                  secondary
                  label={`Xem ca của ${s.studentName}`}
                  onPress={() => {
                    setSelected(s.attemptId);
                    setFeedback("");
                  }}
                />
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <Text style={ui.muted}>Xem lịch và điều chỉnh từng ca vấn đáp.</Text>
          {!exams.length ? (
            <View style={ui.card}>
              <Text style={ui.muted}>Chưa kết nối dữ liệu kỳ thi.</Text>
            </View>
          ) : null}
          {exams.map((e) => (
            <View key={e.id} style={ui.card}>
              <View style={ui.spread}>
                <Badge label={e.courseCode} />
                <Text style={ui.small}>{e.status}</Text>
              </View>
              <Text style={ui.h2}>{e.title}</Text>
              <Text style={ui.text}>{day(e.startTime)}</Text>
              <Text style={ui.muted}>
                {time(e.startTime)} ·{" "}
                {slots.filter((s) => s.examId === e.id).length} thí sinh
              </Text>
              <Button
                label={`Xem lịch ${e.courseName}`}
                onPress={() => {
                  setExamId(e.id);
                  setQuery("");
                  setStatus("");
                  setDateFilter("");
                }}
              />
            </View>
          ))}
        </>
      )}
    </Page>
  );
}
