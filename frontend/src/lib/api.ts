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
