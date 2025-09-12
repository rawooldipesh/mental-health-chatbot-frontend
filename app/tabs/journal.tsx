// app/tabs/journal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform } from "react-native";


type JournalEntry = {
  id: string;
  date: string;      // YYYY-MM-DD (journal day)
  title: string;
  content: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const STORAGE_KEY = "journal.v1";

function todayStr(d = new Date()) {
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [entries]
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setEntries(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load journal:", e);
      }
    })();
  }, []);

  const persist = async (next: JournalEntry[]) => {
    setEntries(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to save journal:", e);
    }
  };

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setContent("");
    setModalOpen(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditing(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setModalOpen(true);
  };

  const saveEntry = async () => {
    const t = title.trim();
    const c = content.trim();
    if (!c) {
      Alert.alert("Write something", "Your journal entry cannot be empty.");
      return;
    }

    if (editing) {
      // update existing
      const next = entries.map((e) =>
        e.id === editing.id ? { ...e, title: t, content: c, updatedAt: new Date().toISOString() } : e
      );
      await persist(next);
      setModalOpen(false);
      setEditing(null);

      // 🔜 Backend mirror:
      // await request(`/journal/${editing.id}`, "PATCH", { title: t, content: c })

      return;
    }

    const now = new Date();
    const entry: JournalEntry = {
      id: Math.random().toString(36).slice(2),
      date: todayStr(now),
      title: t,
      content: c,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const next = [entry, ...entries];
    await persist(next);
    setModalOpen(false);

    // 🔜 Backend mirror:
    // await request("/journal", "POST", entry)
  };

  const deleteEntry = async (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    await persist(next);

    // 🔜 Backend mirror:
    // await request(`/journal/${id}`, "DELETE")
  };

  return (
  <LinearGradient colors={["#87a9e0", "#eef3f5"]} style={{ flex: 1 }}>
    {/* single wrapper so LinearGradient has exactly one child */}
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.header}>Daily Journal</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={openNew} activeOpacity={0.9}>
            <Ionicons name="add-circle-outline" size={22} color="#4f8cff" />
            <Text style={styles.iconBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Today quick-create tip */}
        <View style={styles.tipCard}>
          <Ionicons name="pencil-outline" size={18} color="#4f8cff" />
          <Text style={styles.tipText}>
            {`Write today's reflection (${todayStr()})—capture how you felt, what went well, and any challenges.`}
          </Text>
        </View>

        {/* Entries list */}
        {sorted.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="book-outline" size={22} color="#4f8cff" />
            <Text style={styles.emptyText}>No entries yet. Start your first reflection!</Text>
          </View>
        ) : (
          sorted.map((e) => (
            <View key={e.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateText}>
                  {e.date} • {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                {e.title ? <Text style={styles.title}>{e.title}</Text> : null}
                <Text numberOfLines={3} style={styles.preview}>
                  {e.content}
                </Text>
                <Text style={styles.updatedAt}>Updated {new Date(e.updatedAt).toLocaleString()}</Text>
              </View>

              <View style={styles.actionsCol}>
                <TouchableOpacity
                  onPress={() => openEdit(e)}
                  style={[styles.actionBtn, { backgroundColor: "#eaf1ff" }]}
                  activeOpacity={0.9}
                >
                  <Ionicons name="create-outline" size={18} color="#4f8cff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Delete entry?", "This will remove the entry permanently.", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteEntry(e.id) },
                    ])
                  }
                  style={[styles.actionBtn, { backgroundColor: "#fff5f5" }]}
                  activeOpacity={0.9}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create/Edit modal */}
      <Modal transparent visible={modalOpen} animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            style={{ width: "100%" }}
          >
            <Pressable style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editing ? "Edit Entry" : "New Entry"}</Text>

              <TextInput
                placeholder="Title (optional)"
                placeholderTextColor="#999"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
              />

              <TextInput
                placeholder="Write your reflection..."
                placeholderTextColor="#999"
                style={styles.textArea}
                value={content}
                onChangeText={setContent}
                multiline
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={saveEntry} activeOpacity={0.9}>
                <Text style={styles.primaryBtnText}>{editing ? "Save Changes" : "Save Entry"}</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  </LinearGradient>
);

}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 56 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  header: { fontSize: 20, fontWeight: "700", color: "#183f88ff" },

  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  iconBtnText: { marginLeft: 6, color: "#4f8cff", fontWeight: "700" },

  tipCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  tipText: { flex: 1, color: "#333" },

  emptyCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    flexDirection: "row",
    gap: 10,
  },
  emptyText: { color: "#333", fontWeight: "600" },

  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dateText: { color: "#4f8cff", fontSize: 12, fontWeight: "700" },
  title: { fontSize: 16, fontWeight: "700", color: "#111", marginTop: 4 },
  preview: { marginTop: 4, color: "#444" },
  updatedAt: { color: "#888", fontSize: 12, marginTop: 6 },

  actionsCol: { alignItems: "center", gap: 8 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111",
    backgroundColor: "#fafafa",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111",
    backgroundColor: "#fafafa",
    marginTop: 10,
    minHeight: 140,
    textAlignVertical: "top",
  },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#4f8cff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
});
