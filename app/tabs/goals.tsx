import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function GoalsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with back button and title */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push("/tabs/homescreen")}>
          <Text style={styles.backButton}>{"< Back"}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Goals Screen</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.text}>Set and track your goals 🎯</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: "#ff9800",
    fontWeight: "500",
    marginRight: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
});
