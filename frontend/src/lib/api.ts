import { useAppStore } from "@/store/useAppStore";

export function getBackendHost(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "localhost";
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    // 1. Memory token from Zustand store
    const storeToken = useAppStore.getState().token;
    if (storeToken) return storeToken;

    // 2. Direct key fallback
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;

    // 3. Fallback to persisted caltrack-storage
    try {
      const storage = localStorage.getItem("caltrack-storage");
      if (storage) {
        const parsed = JSON.parse(storage);
        if (parsed?.state?.token) return parsed.state.token;
      }
    } catch (e) {
      // ignore JSON parse error
    }
  }
  return null;
}

export interface ApiMealLogEntry {
  id: string;
  mealLogId: string;
  foodId: string | null;
  meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  servingQuantity: number;
  unitName: string;
  loggedWeightGrams: number;
  loggedCaloriesKcal: number;
  loggedProteinG: number;
  loggedCarbohydratesG: number;
  loggedFatG: number;
  createdAt: string;
  food?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface ApiMealLog {
  id: string;
  userId: string;
  date: string;
  entries: ApiMealLogEntry[];
}

export async function fetchDailyLog(dateStr: string): Promise<ApiMealLog | null> {
  const token = getAuthToken();
  if (!token) return null;
  
  const host = getBackendHost();
  const res = await fetch(`http://${host}:3001/meal/daily?date=${dateStr}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error('Failed to fetch daily log');
  }

  return res.json();
}

export interface LogMealPayload {
  date: string; // YYYY-MM-DD
  foodId?: string;
  meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  servingQuantity: number;
  unitName: string;
  loggedWeightGrams: number;
  loggedCaloriesKcal: number;
  loggedProteinG: number;
  loggedCarbohydratesG: number;
  loggedFatG: number;
}

export async function postLogMeal(payload: LogMealPayload): Promise<ApiMealLogEntry> {
  const token = getAuthToken();
  const host = getBackendHost();

  const res = await fetch(`http://${host}:3001/meal/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    console.error('postLogMeal error response:', errorData);

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      useAppStore.getState().logout();
    }

    throw new Error(errorData.message || 'Failed to log meal entry');
  }

  return res.json();
}

export async function deleteMealEntry(id: string): Promise<void> {
  const token = getAuthToken();
  const host = getBackendHost();

  const res = await fetch(`http://${host}:3001/meal/entry/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete meal entry');
  }
}

export interface WeightEntry {
  id: string;
  userId: string;
  weightKg: number;
  recordedAt: string;
}

export interface AdherenceDay {
  date: string;
  logged: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function fetchWeightHistory(): Promise<WeightEntry[]> {
  const token = getAuthToken();
  if (!token) return [];

  const host = getBackendHost();
  const res = await fetch(`http://${host}:3001/progress/weight`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to fetch weight history');
  }

  return res.json();
}

export async function postWeightLog(weightKg: number): Promise<WeightEntry> {
  const token = getAuthToken();
  const host = getBackendHost();

  const res = await fetch(`http://${host}:3001/progress/weight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ weightKg }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to log weight');
  }

  return res.json();
}

export async function fetchAdherence(days: number = 7): Promise<AdherenceDay[]> {
  const token = getAuthToken();
  if (!token) return [];

  const host = getBackendHost();
  const res = await fetch(`http://${host}:3001/progress/adherence?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to fetch adherence data');
  }

  return res.json();
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  weightKg?: number;
  targetWeightKg?: number;
  heightCm?: number;
  goal?: 'LOSE' | 'MAINTAIN' | 'GAIN';
  activityLevel?: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE';
  targetCalories?: number;
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
  timezone?: string;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) return null;

  const host = getBackendHost();
  const res = await fetch(`http://${host}:3001/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error('Failed to fetch user profile');
  }

  return res.json();
}

export async function updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const token = getAuthToken();
  const host = getBackendHost();

  const res = await fetch(`http://${host}:3001/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return res.json();
}

export interface AiFoodSuggestion {
  id: string;
  name: string;
  kcalPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  emoji: string;
  chipColor: string;
  category: string;
}

export interface AiParseResponse {
  text: string;
  suggestedFood?: AiFoodSuggestion;
}

export async function parseAiPrompt(prompt: string): Promise<AiParseResponse> {
  const token = getAuthToken();
  const host = getBackendHost();

  const res = await fetch(`http://${host}:3001/ai/parse-prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to analyze AI prompt');
  }

  return res.json();
}

export async function scanMealImage(imageBase64: string): Promise<AiParseResponse> {
  const token = getAuthToken();
  const host = getBackendHost();

  const res = await fetch(`http://${host}:3001/ai/scan-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to scan meal photo');
  }

  return res.json();
}
