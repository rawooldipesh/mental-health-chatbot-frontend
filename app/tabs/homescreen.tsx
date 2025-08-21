import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import FeatureButton from "@/components/featureButton";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { request } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";

type MeResponse = { id: string; email: string; name?: string };

export default function HomeScreen() {
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 1) Preferred: fetch from backend (requires /api/auth/me route)
        const me = await request<MeResponse>("/auth/me", "GET");
        const niceName =
          me?.name?.trim() ||
          (me?.email ? me.email.split("@")[0] : "") ||
          "";
        setDisplayName(niceName);
      } catch {
        // 2) Fallback: read from SecureStore if /auth/me isn't available
        const userStr = await SecureStore.getItemAsync("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr) as { id?: string; email?: string; name?: string };
            const niceName =
              user?.name?.trim() ||
              (user?.email ? user.email.split("@")[0] : "") ||
              "";
            setDisplayName(niceName);
          } catch {
            setDisplayName("");
          }
        }
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear auth + any cached session info
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      await AsyncStorage.removeItem("sessionId"); // if you cached session id
      await AsyncStorage.removeItem("moodData");  // optional: local mood cache

      Alert.alert("Logged Out", "You have been logged out successfully.");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={["#87a9e0ff", "#eef3f5ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Top Row: Greeting + Logout */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>
              Hello{displayName ? "," : ""} {displayName || ""}
            </Text>
            <Text style={styles.subtitle}>How are you feeling today?</Text>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color="#4f8cff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Feature grid */}
        <View style={styles.grid}>
          <FeatureButton title="Chat" icon="chat" onPress={() => router.push("/chat/ChatScreen")} />
          <FeatureButton title="Mood Calendar" icon="calendar" onPress={() => router.push("/tabs/mood_detect")} />
          <FeatureButton title="Meditation" icon="meditation" onPress={() => router.push("/tabs/meditation")} />
          <FeatureButton title="Journal" icon="book" onPress={() => router.push("/tabs/journal")} />
          <FeatureButton title="Goals" icon="target" onPress={() => router.push("/tabs/goals")} />
          <FeatureButton title="SOS" icon="alert" onPress={() => router.push("/tabs/sos")} />
        </View>

        {/* Hero image */}
        <Image
          source={require("../../assets/images/lgog.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logoutText: {
    marginLeft: 6,
    color: "#4f8cff",
    fontWeight: "700",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111",
  },
  subtitle: {
    fontSize: 16,
    color: "#181414ff",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
});
