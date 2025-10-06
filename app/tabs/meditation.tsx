// app/(tabs)/MeditationScreen.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";

export default function MeditationScreen() {
  const exercises = [
    { 
      id: 1, 
      title: "Breathing Exercise", 
      icon: "leaf-outline", 
      desc: "Calm your mind with guided breathing", 
      url: "https://www.youtube.com/watch?v=LiUnFJ8P4gM" // example: 5-min breathing exercise
    },
    { 
      id: 2, 
      title: "Relaxation", 
      icon: "moon-outline", 
      desc: "Short relaxation session for stress relief", 
      url: "https://www.youtube.com/watch?v=krBvzDlL0mM"
    },
    { 
      id: 3, 
      title: "Sleep Sounds", 
      icon: "musical-notes-outline", 
      desc: "Soothing sounds to help you sleep", 
      url: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp" 
    },
    { 
      id: 4, 
      title: "Mindfulness", 
      icon: "flower-outline", 
      desc: "Stay present and mindful with this session", 
      url: "https://www.calm.com/" 
    },
  ];

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Sorry, can't open this link: " + url);
    }
  };

  return (
    <LinearGradient colors={["#87a9e0ff", "#eef3f5ff"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.header}>Meditation & Relaxation</Text>

        {exercises.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => openLink(item.url)} // 👈 open external site
          >
            <Ionicons name={item.icon as any} size={28} color="#4f8cff" style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#183f88ff",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    marginVertical: 8,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  desc: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
});
