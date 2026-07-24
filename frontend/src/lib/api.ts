export function getBackendHost(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "localhost";
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
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
    throw new Error('Failed to log meal entry');
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
