import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";  // ✅ Expo version
import FeatureButton from "@/components/featureButton";
import { Stack } from "expo-router";
export default function HomeScreen() {
  return (
    <LinearGradient
      colors={["#87a9e0ff", "#eef3f5ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
              <Stack.Screen options={{ headerShown: false }} />

        <Text style={styles.greeting}>Hello, Emily</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>

        <View style={styles.grid}>
          <FeatureButton title="Chat" icon="chat" onPress={() => router.push("/chat/ChatScreen")} />
          <FeatureButton title="Mood Calendar" icon="calendar" onPress={() => router.push("/tabs/mood_detect")} />
          <FeatureButton title="Meditation" icon="meditation" onPress={() => router.push("/tabs/meditation")} />
          <FeatureButton title="Journal" icon="book" onPress={() => router.push("/tabs/journal")} />
          <FeatureButton title="Goals" icon="target" onPress={() => router.push("/tabs/goals")} />
          <FeatureButton title="SOS" icon="alert" onPress={() => router.push("/tabs/sos")} />
        </View>

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
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 6,
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
