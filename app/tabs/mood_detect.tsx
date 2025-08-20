

//using expo routing
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Button } from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function MoodDetectScreen() {
  const [moodData, setMoodData] = useState<{ [key: string]: string }>({});
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const router = useRouter();

  // Load moods from AsyncStorage when screen mounts
  useEffect(() => {
    const loadMoods = async () => {
      const data = await AsyncStorage.getItem("moodData");
      if (data) {
        setMoodData(JSON.parse(data));
      }
    };
    loadMoods();
  }, []);

  const handleDayPress = (day: any) => {
    const date = day.dateString;
    const mood = moodData[date];
    if (mood) {
      setSelectedMood(mood);
    } else {
      setSelectedMood(null);
      Alert.alert("No mood saved", "You didn’t log a mood for this day.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button to Home */}
      <View style={styles.headerRow}>
        <Button title="< Back" onPress={() => router.push("/tabs/homescreen")} />
        <Text style={styles.header}>Mood Calendar</Text>
      </View>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={Object.keys(moodData).reduce((acc, date) => {
          acc[date] = { marked: true, dotColor: "#ff9800" };
          return acc;
        }, {} as any)}
        theme={{
          backgroundColor: "#F5F5F5",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#278ed3ff",
          selectedDayBackgroundColor: "#278ed3ff",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#278ed3ff",
          dayTextColor: "#333333",
          textDisabledColor: "#cccccc",
          monthTextColor: "#333333",
          arrowColor: "#278ed3ff",
          dotColor: "#278ed3ff",
          selectedDotColor: "#ffffff",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textMonthFontWeight: "600",
          textDayHeaderFontSize: 14,
        }}
      />

      {selectedMood && (
        <View style={styles.moodBox}>
          <Text style={styles.moodText}>Mood: {selectedMood}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  moodBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  moodText: { fontSize: 18, fontWeight: "500", color: "#278ed3ff" },
});
