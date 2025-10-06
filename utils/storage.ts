// app/utils/storage.ts
/**
 * Cross-platform storage shim.
 * - On web: uses localStorage
 * - On native: uses expo-secure-store
 *
 * Also provides some alternate method names (getValueWithKeyAsync, setValueWithKeyAsync)
 * so code that expects older/different APIs won't crash on web.
 */

import * as ExpoSecureStore from "expo-secure-store";

const isWeb = typeof window !== "undefined" && (window as any).document != null;

type StorageShape = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;

  // alternate names some code/libraries might call:
  getValueWithKeyAsync?(key: string): Promise<string | null>;
  setValueWithKeyAsync?(key: string, value: string): Promise<void>;
  deleteValueWithKeyAsync?(key: string): Promise<void>;
};

const webImpl: StorageShape = {
  async getItemAsync(key: string) {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  async setItemAsync(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  async deleteItemAsync(key: string) {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  // compatibility aliases
  async getValueWithKeyAsync(key: string) {
    return this.getItemAsync(key);
  },
  async setValueWithKeyAsync(key: string, value: string) {
    return this.setItemAsync(key, value);
  },
  async deleteValueWithKeyAsync(key: string) {
    return this.deleteItemAsync(key);
  },
};

// On native, wrap ExpoSecureStore but make sure required functions exist
const nativeImpl: StorageShape = {
  async getItemAsync(key: string) {
    // expo-secure-store's API is getItemAsync on supported versions
    if ((ExpoSecureStore as any).getItemAsync) {
      return (ExpoSecureStore as any).getItemAsync(key);
    }
    // fallback to older / alternative name if present
    if ((ExpoSecureStore as any).getValueWithKeyAsync) {
      return (ExpoSecureStore as any).getValueWithKeyAsync(key);
    }
    // last resort
    return Promise.resolve(null);
  },

  async setItemAsync(key: string, value: string) {
    if ((ExpoSecureStore as any).setItemAsync) {
      return (ExpoSecureStore as any).setItemAsync(key, value);
    }
    if ((ExpoSecureStore as any).setValueWithKeyAsync) {
      return (ExpoSecureStore as any).setValueWithKeyAsync(key, value);
    }
    return Promise.resolve();
  },

  async deleteItemAsync(key: string) {
    if ((ExpoSecureStore as any).deleteItemAsync) {
      return (ExpoSecureStore as any).deleteItemAsync(key);
    }
    if ((ExpoSecureStore as any).deleteValueWithKeyAsync) {
      return (ExpoSecureStore as any).deleteValueWithKeyAsync(key);
    }
    return Promise.resolve();
  },

  // provide aliases too (in case other code expects them)
  async getValueWithKeyAsync(key: string) {
    return this.getItemAsync(key);
  },
  async setValueWithKeyAsync(key: string, value: string) {
    return this.setItemAsync(key, value);
  },
  async deleteValueWithKeyAsync(key: string) {
    return this.deleteItemAsync(key);
  },
};

export const storage: StorageShape = isWeb ? webImpl : nativeImpl;

// also export a "default" for modules that import default export
export default storage;
