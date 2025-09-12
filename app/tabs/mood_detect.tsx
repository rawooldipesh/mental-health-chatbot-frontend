// using expo routing
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform } from "react-native";
type MoodKey = "great" | "good" | "neutral" | "low" | "down";

const MOODS: { key: MoodKey; label: string; color: string; dot: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "great",  label: "Great",   color: "#34d399", dot: "#34d399", icon: "happy-outline" },
  { key: "good",   label: "Good",    color: "#60a5fa", dot: "#60a5fa", icon: "happy-outline" },
  { key: "neutral",label: "Neutral", color: "#a3a3a3", dot: "#a3a3a3", icon: "remove-outline" },
  { key: "low",    label: "Low",     color: "#f59e0b", dot: "#f59e0b", icon: "sad-outline" },
  { key: "down",   label: "Down",    color: "#ef4444", dot: "#ef4444", icon: "sad-outline" },
];

function todayStr() {
  const d = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`; // YYYY-MM-DD
}

export default function MoodDetectScreen() {
  const [moodData, setMoodData] = useState<Record<string, MoodKey>>({});
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const router = useRouter();

  // Load moods from AsyncStorage when screen mounts
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem("moodData");
        if (data) setMoodData(JSON.parse(data));
      } catch (e) {
        console.warn("Failed to load moods:", e);
      }
    })();
  }, []);

  // Build markedDates for the calendar based on saved moods
  const markedDates = useMemo(() => {
    const base: Record<string, any> = {};
    Object.keys(moodData).forEach((date) => {
      const moodKey = moodData[date];
      const mood = MOODS.find((m) => m.key === moodKey);
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

  const handleDayPress = (day: any) => {
    const date = day.dateString;
    setSelectedDay(date);
    const moodKey = moodData[date];
    if (moodKey) {
      setSelectedMood(moodKey);
    } else {
      setSelectedMood(null);
      Alert.alert("No mood saved", "You didn’t log a mood for this day.");
    }
  };

  const saveTodayMood = async () => {
    if (!selectedMood) {
      Alert.alert("Select a mood", "Please choose how you feel today.");
      return;
    }
    const date = todayStr();
    const updated = { ...moodData, [date]: selectedMood };
    try {
      await AsyncStorage.setItem("moodData", JSON.stringify(updated));
      setMoodData(updated);
      setSelectedDay(date);
      setNote("");
      Alert.alert("Saved", "Your mood has been logged for today.");

      // 🔜 Backend hook (future):
      // await request("/moods", "POST", { date, mood: selectedMood, note });
    } catch (e) {
      Alert.alert("Error", "Failed to save mood. Please try again.");
    }
  };

return (
  <LinearGradient colors={["#87a9e0", "#eef3f5"]} style={{ flex: 1 }}>
    {/* single wrapper so LinearGradient has exactly one child */}
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Stack.Screen options={{ headerShown: false }} />

          {/* Top bar */}
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
            onDayPress={handleDayPress}
            markedDates={markedDates}
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

          {/* How are you feeling today? */}
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
                      {
                        borderColor: m.color,
                        backgroundColor: active ? m.color : "white",
                      },
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
                    <Text
                      style={[
                        styles.moodChipText,
                        { color: active ? "#fff" : "#111" },
                      ]}
                    >
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

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveTodayMood}
              activeOpacity={0.9}
            >
              <Text style={styles.saveBtnText}>Save Today’s Mood</Text>
            </TouchableOpacity>
          </View>

          {/* Selected day info */}
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
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  backText: { marginLeft: 4, color: "#4f8cff", fontWeight: "600" },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color:"#183f88ff",
    textAlign: "center",
  },
  calendar: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  card: {
    backgroundColor: "white",
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

  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  moodChipText: {
    fontSize: 14,
    fontWeight: "600",
  },

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
