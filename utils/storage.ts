import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const webStore = {
  async getItemAsync(key: string) {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItemAsync(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  async deleteItemAsync(key: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

// Choose SecureStore on native, localStorage on web
export const storage = Platform.OS === "web"
  ? webStore
  : {
      async getItemAsync(key: string) {
        // SecureStore might be unavailable on some simulators
        const avail = await SecureStore.isAvailableAsync();
        if (!avail) return null;
        return SecureStore.getItemAsync(key);
      },
      async setItemAsync(key: string, value: string) {
        const avail = await SecureStore.isAvailableAsync();
        if (!avail) return;
        return SecureStore.setItemAsync(key, value);
      },
      async deleteItemAsync(key: string) {
        const avail = await SecureStore.isAvailableAsync();
        if (!avail) return;
        return SecureStore.deleteItemAsync(key);
      },
    };
