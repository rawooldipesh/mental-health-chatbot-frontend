// app/tabs/goals.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Frequency = "daily" | "weekly" | "monthly";

type Goal = {
  id: string;
  title: string;
  frequency: Frequency;
  createdAt: string; // ISO
  completions: Record<string, true>; // periodKey -> true
};

const STORAGE_KEY = "goals.v1";

function isoDate(d = new Date()) {
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// ISO week number helper
function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function monthKey(d = new Date()) {
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
}

function periodKey(freq: Frequency, d = new Date()) {
  if (freq === "daily") return isoDate(d);
  if (freq === "weekly") return getISOWeek(d);
  return monthKey(d);
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [filter, setFilter] = useState<Frequency | "all">("all");

  // Load from local storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setGoals(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load goals:", e);
      }
    })();
  }, []);

  // Save to local storage
  const saveGoals = async (next: Goal[]) => {
    setGoals(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to save goals:", e);
    }
  };

  const currentKey = periodKey("daily"); // not used directly, just here for clarity
  const nowKeyFor = (freq: Frequency) => periodKey(freq);

  const filteredGoals = useMemo(
    () => goals.filter((g) => (filter === "all" ? true : g.frequency === filter)),
    [goals, filter]
  );

  const addGoal = async () => {
    const clean = title.trim();
    if (!clean) {
      Alert.alert("Add a title", "Please enter a goal title.");
      return;
    }
    const newGoal: Goal = {
      id: Math.random().toString(36).slice(2),
      title: clean,
      frequency,
      createdAt: new Date().toISOString(),
      completions: {},
    };
    await saveGoals([newGoal, ...goals]);
    setTitle("");
    setFrequency("daily");
    setModalOpen(false);

    // 🔜 Backend mirror idea:
    // await request("/goals", "POST", newGoal)
  };

  const toggleComplete = async (goal: Goal) => {
    const key = nowKeyFor(goal.frequency);
    const next = goals.map((g) => {
      if (g.id !== goal.id) return g;
      const comp = { ...g.completions };
      if (comp[key]) {
        delete comp[key];
      } else {
        comp[key] = true;
      }
      return { ...g, completions: comp };
    });
    await saveGoals(next);

    // 🔜 Backend mirror idea:
    // await request(`/goals/${goal.id}/complete`, "PATCH", { periodKey: key })
  };

  const removeGoal = async (goalId: string) => {
    const next = goals.filter((g) => g.id !== goalId);
    await saveGoals(next);

    // 🔜 Backend mirror idea:
    // await request(`/goals/${goalId}`, "DELETE")
  };

  const isDoneThisPeriod = (g: Goal) => !!g.completions[nowKeyFor(g.frequency)];

  return (
    <LinearGradient colors={["#87a9e0ff", "#eef3f5ff"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.header}>Your Goals</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setModalOpen(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={22} color="#4f8cff" />
              <Text style={styles.iconBtnText}>New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["all", "daily", "weekly", "monthly"] as const).map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterChip,
                  { backgroundColor: active ? "#4f8cff" : "#fff", borderColor: "#4f8cff" },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterChipText, { color: active ? "#fff" : "#4f8cff" }]}>
                  {f[0].toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Goal List */}
        {filteredGoals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="flag-outline" size={24} color="#4f8cff" />
            <Text style={styles.emptyText}>No goals yet. Create your first one!</Text>
          </View>
        ) : (
          filteredGoals.map((g) => {
            const done = isDoneThisPeriod(g);
            return (
              <View key={g.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>{g.title}</Text>
                  <Text style={styles.goalMeta}>
                    {g.frequency === "daily" && "Daily"}
                    {g.frequency === "weekly" && "Weekly"}
                    {g.frequency === "monthly" && "Monthly"} • Created{" "}
                    {new Date(g.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: done ? "#34d399" : "#f59e0b" }]}>
                      <Ionicons
                        name={done ? "checkmark-circle-outline" : "time-outline"}
                        size={14}
                        color="#fff"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.badgeText}>
                        {done ? "Done this period" : "Pending this period"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsCol}>
                  <TouchableOpacity
                    onPress={() => toggleComplete(g)}
                    style={[styles.actionBtn, { backgroundColor: done ? "#e5f9f1" : "#eaf1ff" }]}
                    activeOpacity={0.9}
                  >
                    <Ionicons
                      name={done ? "refresh-outline" : "checkmark-outline"}
                      size={18}
                      color={done ? "#10b981" : "#4f8cff"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Delete goal?", "This will remove the goal permanently.", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => removeGoal(g.id) },
                      ])
                    }
                    style={[styles.actionBtn, { backgroundColor: "#fff5f5" }]}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal transparent visible={modalOpen} animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Create Goal</Text>

            <TextInput
              placeholder="e.g., 10-minute meditation"
              placeholderTextColor="#999"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.freqRow}>
              {(["daily", "weekly", "monthly"] as const).map((f) => {
                const active = frequency === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFrequency(f)}
                    style={[
                      styles.freqChip,
                      { backgroundColor: active ? "#4f8cff" : "#fff", borderColor: "#4f8cff" },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.freqChipText, { color: active ? "#fff" : "#4f8cff" }]}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={addGoal} activeOpacity={0.9}>
              <Text style={styles.primaryBtnText}>Add Goal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 56 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#183f88ff",
  },
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

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  filterChipText: { fontWeight: "700" },

  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  goalMeta: { fontSize: 12, color: "#666", marginTop: 2 },
  badgeRow: { flexDirection: "row", marginTop: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

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
  label: { marginTop: 12, marginBottom: 6, fontWeight: "700", color: "#111" },
  freqRow: { flexDirection: "row", gap: 8 },
  freqChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  freqChipText: { fontWeight: "700" },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#4f8cff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
});
