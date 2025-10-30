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
  deleteMood,
  getMoodSummary,
} from "../../services/moodService"; // ✅ backend service imports
import { analyzeSentiment, sentimentLabelToScore } from "../../utils/sentimentHelper"; // ✅ sentiment analysis import
import AsyncStorage from "@react-native-async-storage/async-storage";
type MoodKey = "great" | "good" | "neutral" | "low" | "down";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

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
  const [summary, setSummary] = useState<{
    avgSentiment?: number;
    totalEntries?: number;
    positive?: number;
    neutral?: number;
    negative?: number;
  }>({});

  // ✅ Fetch moods once from backend on mount
 useEffect(() => {
  (async () => {
    try {
      const response = await fetchAllMoods();
      if (response.moods && Array.isArray(response.moods)) {
        const map: Record<string, MoodKey> = {};
        response.moods.forEach((m) => (map[m.date] = m.mood as MoodKey));
        setMoodData(map);
      }
    } catch (err) {
      console.warn("Failed to load moods:", err);
    }
  })();

 const fetchSummary = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    console.log("Stored user value:", user);

    if (!user) {
      console.warn("No user found in storage");
      return;
    }

    const parsedUser = JSON.parse(user);
    const userId = parsedUser.id || parsedUser._id; // ✅ handle both cases
    if (!userId) {
      console.warn("User object missing id/_id:", parsedUser);
      return;
    }

    console.log("📌 Fetching summary for user:", userId);
    const summary = await getMoodSummary(userId); // ✅ pass correct ID
    console.log("✅ Weekly Sentiment Summary:", summary);
    setSummary(summary);
  } catch (err) {
    console.error("Error fetching summary:", err);
  }
};


  fetchSummary();
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
      // 🧠 Step 1: Analyze sentiment of note
      const sentimentLabel = analyzeSentiment(note);
      const sentimentScore = sentimentLabelToScore(sentimentLabel);

      // 🧠 Step 2: Save mood with numeric sentiment
      const saved = await saveMood({
        date: target,
        mood: selectedMood,
        note,
        sentiment: sentimentScore, // numeric value sent to backend
      });

      console.log("DEBUG: saveMood response:", saved);

      // 🧠 Step 3: Handle response and update UI
      const returnedMood: Mood | undefined =
        saved?.mood || (("date" in (saved as any)) ? (saved as any) : undefined);

      if (returnedMood && returnedMood.date) {
        setMoodData((prev) => ({
          ...prev,
          [returnedMood.date]: returnedMood.mood as MoodKey,
        }));
      } else {
        setMoodData((prev) => ({ ...prev, [target]: selectedMood }));
      }

      setSelectedDay(target);
      setNote("");
      Alert.alert(
        "Success",
        `Your mood for ${target} was saved! (Sentiment: ${sentimentLabel})`
      );

    } catch (err) {
      console.error("saveMood error (catch):", err);
      Alert.alert("Error", "Failed to save mood. Please try again later.");
    }
  };


  const handleDeleteMood = async (date: string) => {
    Alert.alert(
      "Delete Mood",
      `Are you sure you want to delete your mood for ${date}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteMood(date);
              console.log("Delete mood response:", res);

              if (res?.success) {
                // Remove mood locally
                setMoodData((prev) => {
                  const updated = { ...prev };
                  delete updated[date];
                  return updated;
                });

                Alert.alert("Deleted", `Mood for ${date} has been removed.`);
              } else {
                Alert.alert("Error", "Could not delete mood. Please try again.");
              }
            } catch (err) {
              console.error("Delete mood error:", err);
              Alert.alert("Error", "Failed to delete mood. Try again later.");
            }
          },
        },
      ]
    );
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
                  <View style={[styles.moodBox, { alignItems: "center" }]}>
                    <Text style={styles.moodText}>
                      Mood: {MOODS.find((m) => m.key === moodData[selectedDay])?.label}
                    </Text>

                    {/* <TouchableOpacity
                      onPress={() => handleDeleteMood(selectedDay)}
                      style={styles.deleteBtn}
                      activeOpacity={0.8}
                    > */}
                      {/* <Ionicons name="trash-outline" size={18} color="#fff" /> */}
                      {/* <Text style={styles.deleteBtnText}>Delete Mood</Text> */}
                    {/* </TouchableOpacity> */}
                  </View>
                ) : (
                  <Text style={styles.subText}>No mood logged for this date.</Text>
                )}
               {summary && (
 <View
  style={{
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  }}
>
  {/* <Text
    style={{
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 12,
      textAlign: "center",
    }}
  > */}
    {/* Mood History (Last 7 Days) */}
  {/* </Text> */}

  {/* <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 10 }}
  >
    {Object.entries(moodData)
      .slice(-7)
      .map(([date, mood]) => (
        <View
          key={date}
          style={{
            alignItems: "center",
            marginHorizontal: 10,
            backgroundColor: "#f8fafc",
            borderRadius: 10,
            padding: 10,
            width: 80,
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text style={{ fontWeight: "600", color: "#183f88" }}>
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </Text>

          <Text style={{ fontSize: 28, marginVertical: 4 }}>
            {mood === "great"
              ? "😄"
              : mood === "neutral"
              ? "😐"
              : mood === "low"
              ? "😔"
              : mood === "down"
              ? "😢"
              : "🤔"}
          </Text>

          <Text style={{ fontSize: 12, color: "#64748b" }}>
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </Text>
        </View>
      ))}
  </ScrollView> */}

  <View
    style={{
      backgroundColor: "#e0f2fe",
      borderRadius: 10,
      marginTop: 15,
      padding: 10,
    }}
  >
    <Text style={{ fontWeight: "700", color: "#183f88", marginBottom: 6 }}>
      Insight
    </Text>
    <Text style={{ color: "#333", fontSize: 14, textAlign: "center" }}>
      {summary
        ? summary.positive! > (summary.negative || 0)
          ? "You had more positive moods this week! Keep up the good energy. 🌞"
          : summary.negative! > (summary.positive || 0)
          ? "You experienced more low moods recently. Try relaxing or journaling 💙"
          : "Your moods have been balanced lately — keep taking care of yourself 💫"
        : "Loading your weekly insights..."}
    </Text>
  </View>
</View>


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
  deleteBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e63946",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 2,
    fontSize: 14,
  },

});
