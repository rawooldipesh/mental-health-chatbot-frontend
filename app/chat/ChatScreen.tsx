// frontend/screens/ChatScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { request } from "../../services/api";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const userMsg = input;
    setInput("");

    try {
      const res = await request<{ reply: string }>("/chat/send", "POST", { message: userMsg });
      setMessages((prev) => [...prev, { sender: "bot", text: res.reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `⚠️ ${e.message || "Error fetching reply"}` },
      ]);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <LinearGradient colors={["#f9f9f9", "#e6f0ff"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <Stack.Screen options={{ headerShown: false }} />

        {/* ✅ Custom Header */}
        <View style={styles.header}>
          <Ionicons name="chatbubbles-outline" size={26} color="#4f8cff" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>FEELFREE</Text>
        </View>

        {/* Chat area */}
        <ScrollView
          style={styles.chat}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.messageBubble,
                m.sender === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  m.sender === "user" ? styles.userText : styles.botText,
                ]}
              >
                {m.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, paddingTop: 60},

  /* ✅ Header styling */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4f8cff",
    letterSpacing: 1,
  },

  chat: { flex: 1 },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: "#4f8cff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15 },
  userText: { color: "white" },
  botText: { color: "#333" },

  inputRow: {
    flexDirection: "row",
    paddingBottom: 10,
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 30,
    margin: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    color: "#333",

  },
  sendButton: {
    backgroundColor: "#4f8cff",
    padding: 10,
    borderRadius: 25,
    marginLeft: 6,
  },
});
