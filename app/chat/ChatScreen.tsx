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
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  startSession,
  endSession,
  sendMessage as sendChatMessage,
  fetchHistory,
  listSessions,
  Message,
  Session,
} from "../../services/chatService";

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load previous sessions -> resume latest or create new
  useEffect(() => {
    let activeSessionId: string | null = null;

    (async () => {
      try {
        const sess = await listSessions(); // existing sessions for this user
        setSessions(sess);

        if (sess.length > 0) {
          // pick the latest by createdAt/startedAt
          const latest = [...sess].sort(
            (a, b) =>
              new Date(b.createdAt || b.startedAt).getTime() -
              new Date(a.createdAt || a.startedAt).getTime()
          )[0];

          setSessionId(latest._id);
          activeSessionId = latest._id;

          const history = await fetchHistory(latest._id);
          setMessages(history || []);
        } else {
          const { sessionId } = await startSession();
          setSessionId(sessionId);
          activeSessionId = sessionId;
          setMessages([]); // nothing yet
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    })();

    // end the active session on unmount (optional)
    return () => {
      if (activeSessionId) {
        endSession(activeSessionId).catch((e) =>
          console.error("End session failed:", e)
        );
      }
    };
  }, []);

  // Send user message
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMsg: Message = {
      sender: "user",
      text: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const userInput = input;
    setInput("");

    try {
      const res = await sendChatMessage(sessionId, userInput);
      const botMsg: Message = {
        sender: "bot",
        text: res.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `⚠️ ${e.message || "Error fetching reply"}` },
      ]);
    }
  };

  // New chat (start a fresh session)
  const handleNewChat = async () => {
    try {
      const { sessionId: newId } = await startSession();
      setSessionId(newId);
      setMessages([]);
      // refresh sessions list
      const sess = await listSessions();
      setSessions(sess);
    } catch (e) {
      console.error("Failed to start new chat:", e);
    }
  };

  // Open a specific previous session
  const openSession = async (id: string) => {
    try {
      setPickerOpen(false);
      setSessionId(id);
      const history = await fetchHistory(id);
      setMessages(history || []);
    } catch (e) {
      console.error("Failed to load session history:", e);
    }
  };

  // Auto-scroll on new message
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <LinearGradient colors={["#eaedf1ff", "#69aac4ff"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            name="chatbubbles-outline"
            size={26}
            color="#4f8cff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.headerTitle}>FEELFREE</Text>

          {/* Right actions */}
          <View style={{ position: "absolute", right: 12, flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => setPickerOpen(true)}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="albums-outline" size={22} color="#4f8cff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNewChat}>
              <Ionicons name="add-circle-outline" size={24} color="#4f8cff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat area */}
        <ScrollView
          style={styles.chat}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {messages.map((m, i) => (
            <View
              key={`${m.createdAt || i}-${i}`}
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
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Session picker modal with horizontal scroll row */}
        <Modal
          transparent
          visible={pickerOpen}
          animationType="fade"
          onRequestClose={() => setPickerOpen(false)}
        >
          {/* Backdrop sits at top so we can anchor under header */}
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPickerOpen(false)}
          >
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Your Sessions</Text>

              {/* Horizontal scrollable session chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sessionsRow}
              >
                {sessions.length === 0 ? (
                  <View style={styles.emptyChip}>
                    <Text style={{ color: "#666" }}>No sessions</Text>
                  </View>
                ) : (
                  sessions.map((s) => {
                    const ended = !!s.endedAt;
                    const label = new Date(s.createdAt || s.startedAt).toLocaleString();
                    const active = s._id === sessionId;
                    return (
                      <TouchableOpacity
                        key={s._id}
                        style={[
                          styles.sessionChip,
                          active && styles.sessionChipActive,
                          ended && styles.sessionChipEnded,
                        ]}
                        onPress={() => openSession(s._id)}
                      >
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.sessionChipText,
                            active && styles.sessionChipTextActive,
                          ]}
                        >
                          {label}
                        </Text>
                        {ended && <Text style={styles.endedBadge}>ended</Text>}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Full vertical list (scrollable) */}
              <ScrollView style={{ maxHeight: 260 }}>
                {sessions.length === 0 ? (
                  <Text style={{ color: "#555", marginTop: 8 }}>
                    No previous sessions.
                  </Text>
                ) : (
                  sessions.map((s) => (
                    <TouchableOpacity
                      key={s._id}
                      style={styles.sessionItem}
                      onPress={() => openSession(s._id)}
                    >
                      <Ionicons
                        name="chatbox-ellipses-outline"
                        size={18}
                        color="#4f8cff"
                      />
                      <Text style={styles.sessionText}>
                        {new Date(s.createdAt || s.startedAt).toLocaleString()}
                        {s.endedAt ? "  (ended)" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, paddingTop: 60 },

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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start", // anchor to top
    paddingTop: 70, // place modal under header (adjust if your header height changes)
  },
  modalSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: 10,
    // shadow for iOS/Android
    elevation: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },

  // new horizontal sessions row
  sessionsRow: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  sessionChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f2f7ff",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  sessionChipActive: {
    backgroundColor: "#4f8cff",
  },
  sessionChipEnded: {
    opacity: 0.8,
  },
  sessionChipText: {
    fontSize: 12,
    color: "#114074",
  },
  sessionChipTextActive: {
    color: "#fff",
  },
  endedBadge: {
    marginTop: 4,
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#cc3f3f",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
  },
  emptyChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  sessionText: {
    marginLeft: 8,
    color: "#333",
  },
});
