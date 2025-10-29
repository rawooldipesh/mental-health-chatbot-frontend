// using expo routing
// mood detection calendar screen

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchAllMoods,
  saveMood,
  fetchMoodByDate,
  Mood,
} from "../../services/moodService"; // ✅ backend service imports

type MoodKey = "great" | "good" | "neutral" | "low" | "down";

const MOODS: {
  key: MoodKey;
  label: string;
  color: string;
  dot: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "great", label: "Great", color: "#34d399", dot: "#34d399", icon: "happy-outline" },
  { key: "good", label: "Good", color: "#60a5fa", dot: "#60a5fa", icon: "happy-outline" },
  { key: "neutral", label: "Neutral", color: "#a3a3a3", dot: "#a3a3a3", icon: "remove-outline" },
  { key: "low", label: "Low", color: "#f59e0b", dot: "#f59e0b", icon: "sad-outline" },
  { key: "down", label: "Down", color: "#ef4444", dot: "#ef4444", icon: "sad-outline" },
];

// ✅ Helper functions
function todayStr() {
  const d = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function isFutureDate(dateStr: string) {
  return dateStr > todayStr();
}

export default function MoodCalendarScreen() {
  const [moodData, setMoodData] = useState<Record<string, MoodKey>>({});
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const router = useRouter();

  // ✅ Fetch moods once from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const response = await fetchAllMoods();
        if (response.moods && Array.isArray(response.moods)) {
          const map: Record<string, MoodKey> = {};
          response.moods.forEach((m) => (map[m.date] = m.mood as MoodKey));
          setMoodData(map);
        } else {
          console.warn("Fetched moods are not an array:", response.moods);
        }
      } catch (err) {
        console.warn("Failed to load moods:", err);
      }
    })();
  }, []);

  // ✅ Highlight marked dates + selected day
  const markedDates = useMemo(() => {
    const base: Record<string, any> = {};
    Object.keys(moodData).forEach((date) => {
      const mood = MOODS.find((m) => m.key === moodData[date]);
      if (mood) base[date] = { marked: true, dotColor: mood.dot };
    });
    if (selectedDay) {
      base[selectedDay] = {
        ...(base[selectedDay] || {}),
        selected: true,
        selectedColor: "#4f8cff",
        selectedTextColor: "#ffffff",
      };
    }
    return base;
  }, [moodData, selectedDay]);

  // ✅ Handle date selection
  const handleDayPress = async (day: any) => {
    const date = day.dateString;
    if (isFutureDate(date)) {
      Alert.alert("Cannot select future dates");
      return;
    }

    setSelectedDay(date);

    try {
      const fetched = await fetchMoodByDate(date);
      if (fetched) {
        setSelectedMood(fetched.mood as MoodKey);
        setNote(fetched.note || "");
      } else {
        setSelectedMood(null);
        setNote("");
      }
    } catch (err) {
      setSelectedMood(null);
      setNote("");
      Alert.alert("No mood saved", "You didn’t log a mood for this day.");
    }
  };

  // ✅ Save mood for selected or today
// ✅ Save mood for selected or today (robust + debug)
const saveMoodForDate = async (date?: string) => {
  const target = date || todayStr();

  if (isFutureDate(target)) {
    Alert.alert("Invalid date", "Cannot save a mood for a future date.");
    return;
  }
  if (!selectedMood) {
    Alert.alert("Select a mood", "Please choose how you feel.");
    return;
  }

  try {
    const saved = await saveMood({ date: target, mood: selectedMood, note });
    console.log("DEBUG: saveMood response:", saved);

    // ✅ Support multiple backend shapes: either { success, mood } or direct { date, mood }
    const returnedMood: Mood | undefined =
      saved?.mood || (("date" in (saved as any)) ? (saved as any) : undefined);

    if (returnedMood && returnedMood.date) {
      // ✅ Update local mood data immediately for real-time UI refresh
      setMoodData((prev) => ({
        ...prev,
        [returnedMood.date]: returnedMood.mood as MoodKey,
      }));
    } else {
      // fallback local update
      setMoodData((prev) => ({ ...prev, [target]: selectedMood }));
    }

    // ✅ Refresh selected day and note
    setSelectedDay(target);
    setNote("");

    Alert.alert("Success", `Your mood for ${target} was saved!`);

    // ✅ Optional: navigate back to home after save
    // router.replace("/home");   // uncomment this line if you want redirect
  } catch (err) {
    console.error("saveMood error (catch):", err);
    Alert.alert("Error", "Failed to save mood. Please try again later.");
  }
};


  const saveTodayMood = () => saveMoodForDate(todayStr());

  return (
    <LinearGradient colors={["#87a9e0", "#eef3f5"]} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.push("/tabs/homescreen")}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={20} color="#4f8cff" />
                <Text style={styles.backText}>Home</Text>
              </TouchableOpacity>
              <Text style={styles.header}>Mood Calendar</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Calendar */}
            <Calendar
              key={JSON.stringify(moodData)}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              maxDate={todayStr()}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#4f8cff",
                selectedDayBackgroundColor: "#4f8cff",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#4f8cff",
                dayTextColor: "#333333",
                textDisabledColor: "#cccccc",
                monthTextColor: "#333333",
                arrowColor: "#4f8cff",
                dotColor: "#4f8cff",
                selectedDotColor: "#ffffff",
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textMonthFontWeight: "600",
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />

            {/* Mood Selector */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>How are you feeling today?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => {
                  const active = selectedMood === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[
                        styles.moodChip,
                        { borderColor: m.color, backgroundColor: active ? m.color : "#fff" },
                      ]}
                      onPress={() => setSelectedMood(m.key)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={m.icon}
                        size={18}
                        color={active ? "#fff" : m.color}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.moodChipText, { color: active ? "#fff" : "#111" }]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                placeholder="Optional note (e.g., 'Long day, but handled it well')"
                placeholderTextColor="#999"
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                multiline
                returnKeyType="done"
                blurOnSubmit
              />

              <TouchableOpacity style={styles.saveBtn} onPress={saveTodayMood} activeOpacity={0.9}>
                <Text style={styles.saveBtnText}>Save Today’s Mood</Text>
              </TouchableOpacity>

              {selectedDay && (
                <TouchableOpacity
                  style={[styles.saveBtn, { marginTop: 10, backgroundColor: "#2b8a63" }]}
                  onPress={() => saveMoodForDate(selectedDay)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.saveBtnText}>Save for {selectedDay}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Selected Day Section */}
            {selectedDay && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Selected Day</Text>
                <Text style={styles.subText}>{selectedDay}</Text>
                <View style={{ height: 8 }} />
                {moodData[selectedDay] ? (
                  <View style={styles.moodBox}>
                    <Text style={styles.moodText}>
                      Mood: {MOODS.find((m) => m.key === moodData[selectedDay])?.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.subText}>No mood logged for this date.</Text>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </LinearGradient>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 56 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  backText: { marginLeft: 4, color: "#4f8cff", fontWeight: "600" },
  header: { fontSize: 20, fontWeight: "700", color: "#183f88ff", textAlign: "center" },
  calendar: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  subText: { fontSize: 14, color: "#555" },
  moodRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 10 },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  moodChipText: { fontSize: 14, fontWeight: "600" },
  noteInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    minHeight: 48,
    fontSize: 14,
    color: "#111",
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: "#4f8cff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  moodBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#f6faff",
    borderRadius: 10,
    alignItems: "center",
  },
  moodText: { fontSize: 16, fontWeight: "600", color: "#4f8cff" },
});
