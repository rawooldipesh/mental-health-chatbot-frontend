// app/tabs/sos.tsx
import React, { useEffect, useState } from "react";
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
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform } from "react-native";
type SosContact = {
  id: string;
  name: string;
  phone: string;     // tel format
  type: "personal" | "helpline";
};

const STORAGE_KEY = "sos.contacts.v1";

/**
 * 🇮🇳 Default resources (you can localize later):
 * - Emergency number in India: 112
 * - AASRA: +919820466726 (24x7 suicide prevention)
 * - KIRAN (Gov helpline): 1800-599-0019
 */
const DEFAULT_CONTACTS: SosContact[] = [
  { id: "emergency-112", name: "Emergency (112)", phone: "112", type: "helpline" },
  { id: "aasra", name: "AASRA Helpline", phone: "+919820466726", type: "helpline" },
  { id: "kiran", name: "KIRAN Mental Health", phone: "18005990019", type: "helpline" },
];

export default function SOSScreen() {
  const [contacts, setContacts] = useState<SosContact[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as SosContact[];
          // merge defaults (avoid duplicates by id)
          const merged = [
            ...DEFAULT_CONTACTS,
            ...saved.filter((s) => !DEFAULT_CONTACTS.some((d) => d.id === s.id)),
          ];
          setContacts(merged);
        } else {
          setContacts(DEFAULT_CONTACTS);
        }
      } catch (e) {
        console.warn("Failed to load SOS contacts:", e);
        setContacts(DEFAULT_CONTACTS);
      }
    })();
  }, []);

  const persist = async (list: SosContact[]) => {
    setContacts(list);
    // only persist personal contacts; defaults are hard-coded
    const personal = list.filter((c) => c.type === "personal");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(personal));
  };

  const addContact = async () => {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) {
      Alert.alert("Missing info", "Please provide a name and phone number.");
      return;
    }
    const newItem: SosContact = {
      id: Math.random().toString(36).slice(2),
      name: n,
      phone: p,
      type: "personal",
    };
    await persist([newItem, ...contacts]);
    setName("");
    setPhone("");
    setModalOpen(false);

    // 🔜 Backend mirror idea:
    // await request("/sos/contacts", "POST", newItem)
  };

  const removeContact = async (id: string) => {
    const next = contacts.filter((c) => c.id !== id);
    await persist(next);

    // 🔜 Backend mirror idea:
    // await request(`/sos/contacts/${id}`, "DELETE")
  };

  const callNumber = async (tel: string) => {
    const url = `tel:${tel}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) return Alert.alert("Phone not supported", "Calling is not available on this device.");
    Linking.openURL(url);
  };

  const sendSMS = async (tel: string) => {
    const url = `sms:${tel}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) return Alert.alert("SMS not supported", "Messaging is not available on this device.");
    Linking.openURL(url);
  };

 return (
  <LinearGradient colors={["#87a9e0", "#eef3f5"]} style={{ flex: 1 }}>
    {/* single wrapper so no raw text is a direct child of LinearGradient */}
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.header}>SOS & Support</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setModalOpen(true)} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={22} color="#4f8cff" />
            <Text style={styles.iconBtnText}>Add Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Big safety action */}
        <View style={styles.urgentCard}>
          <Ionicons name="warning-outline" size={24} color="#fff" />
          <Text style={styles.urgentText}>If you feel unsafe or in immediate danger:</Text>
          <TouchableOpacity style={styles.urgentBtn} onPress={() => callNumber("112")} activeOpacity={0.9}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.urgentBtnText}>Call 112 Now</Text>
          </TouchableOpacity>
        </View>

        {/* Contacts list */}
        <Text style={styles.sectionTitle}>Trusted Contacts & Helplines</Text>
        {contacts.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{c.name}</Text>
              <Text style={styles.contactPhone}>{c.phone}</Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: c.type === "helpline" ? "#eaf1ff" : "#e5f9f1" },
                  ]}
                >
                  <Ionicons
                    name={c.type === "helpline" ? "medkit-outline" : "people-outline"}
                    size={14}
                    color={c.type === "helpline" ? "#4f8cff" : "#10b981"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.badgeText,
                      { color: c.type === "helpline" ? "#4f8cff" : "#10b981" },
                    ]}
                  >
                    {c.type === "helpline" ? "Helpline" : "Personal"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsCol}>
              <TouchableOpacity
                onPress={() => callNumber(c.phone)}
                style={[styles.actionBtn, { backgroundColor: "#eaf1ff" }]}
                activeOpacity={0.9}
              >
                <Ionicons name="call-outline" size={18} color="#4f8cff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => sendSMS(c.phone)}
                style={[styles.actionBtn, { backgroundColor: "#fff5f5" }]}
                activeOpacity={0.9}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
              {c.type === "personal" && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Remove contact?", "This will delete the contact.", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => removeContact(c.id) },
                    ])
                  }
                  style={[styles.actionBtn, { backgroundColor: "#fff" }]}
                  activeOpacity={0.9}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Resource tips */}
        <Text style={styles.sectionTitle}>Immediate Coping Tips</Text>
        <View style={styles.tipsCard}>
          <View style={styles.tipRow}>
            <Text style={styles.tipText}>Try 4–7–8 breathing: inhale 4s, hold 7s, exhale 8s (×4).</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="walk-outline" size={18} color="#4f8cff" />
            <Text style={styles.tipText}>Leave the room, drink water, and walk for 2 minutes.</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="ear-outline" size={18} color="#4f8cff" />
            <Text style={styles.tipText}>Call a trusted person from your list above.</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.noteCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#4f8cff" />
          <Text style={styles.noteText}>
            FeelFree is not a substitute for professional help. If you are at risk of harming yourself
            or others, call local emergency services immediately.
          </Text>
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal transparent visible={modalOpen} animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            style={{ width: "100%" }}
          >
            <Pressable style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Add Personal Contact</Text>

              <TextInput
                placeholder="Name (e.g., Mom)"
                placeholderTextColor="#999"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                placeholder="Phone (e.g., +911234567890)"
                placeholderTextColor="#999"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={addContact} activeOpacity={0.9}>
                <Text style={styles.primaryBtnText}>Save Contact</Text>
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
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

  urgentCard: {
    backgroundColor: "#ef4444",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: "center",
  },
  urgentText: { color: "#fff", marginTop: 6, marginBottom: 10 },
  urgentBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  urgentBtnText: { color: "#fff", fontWeight: "800" },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111", marginTop: 16 },

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
  contactName: { fontSize: 16, fontWeight: "700", color: "#111" },
  contactPhone: { fontSize: 13, color: "#555", marginTop: 2 },
  badgeRow: { flexDirection: "row", marginTop: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  actionsCol: { alignItems: "center", gap: 8, marginLeft: "auto" },
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

  tipsCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    gap: 10,
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipText: { color: "#333", flex: 1 },

  noteCard: {
    backgroundColor: "#f6faff",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    flexDirection: "row",
    gap: 8,
  },
  noteText: { color: "#555", flex: 1 },

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
    marginTop: 8,
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
