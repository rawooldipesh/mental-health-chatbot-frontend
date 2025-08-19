// frontend/screens/ChatScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, KeyboardAvoidingView } from "react-native";
import { request } from "../../services/api";

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // show user message immediately
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    const userMsg = input;
    setInput("");

    try {
      const res = await request<{ reply: string }>("/chat/send", "POST", { message: userMsg });
      setMessages(prev => [...prev, { sender: "bot", text: res.reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { sender: "bot", text: `⚠️ ${e.message || "Error fetching reply"}` }]);
    }
  };

  // auto-scroll when new message arrives
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView style={styles.chat} ref={scrollViewRef}>
        {messages.map((m, i) => (
          <Text key={i} style={m.sender === "user" ? styles.user : styles.bot}>
            {m.sender}: {m.text}
          </Text>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  chat: { flex: 1, marginBottom: 8 },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#d1e7ff",
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
});
