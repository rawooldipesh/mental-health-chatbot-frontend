import { API_BASE_URL } from "../utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Mood {
  date: string;
  mood: string;
  note?: string;
  sentiment?: number;
}

export interface SaveMoodResponse {
  success?: boolean;
  mood?: Mood;
}

// ✅ Unified response handler with debug logging
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errText = await res.text();
    console.error("API Error:", errText);
    throw new Error(`HTTP ${res.status}: ${errText || "Request failed"}`);
  }

  const json = await res.json();
  console.log("DEBUG: API response:", json);
  return json;
};

// ✅ Fetch all moods
export const fetchAllMoods = async (): Promise<{ moods: Mood[] }> => {
  const token = await AsyncStorage.getItem("token");
  console.log("DEBUG: token from AsyncStorage:", token);

  const res = await fetch(`${API_BASE_URL}/moods`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(res);
};

// ✅ Fetch mood by date
export const fetchMoodByDate = async (date: string): Promise<Mood> => {
  const token = await AsyncStorage.getItem("token");
  console.log("DEBUG: Fetching mood for date:", date);

  const res = await fetch(`${API_BASE_URL}/moods/${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(res);
};

// ✅ Save mood (typed response)
export const saveMood = async (data: Mood): Promise<SaveMoodResponse> => {
  const token = await AsyncStorage.getItem("token");
  console.log("DEBUG: token from AsyncStorage:", token);

  const res = await fetch(`${API_BASE_URL}/moods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
};

// ✅ Delete mood
export const deleteMood = async (
  date: string
): Promise<{ success: boolean }> => {
  const token = await AsyncStorage.getItem("token");
  console.log("DEBUG: token from AsyncStorage:", token);

  const res = await fetch(`${API_BASE_URL}/moods/${date}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(res);
};
