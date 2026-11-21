import { useAppStore } from "@/store/useAppStore";

/**
 * Resolves the backend API base URL:
 * 1. Uses process.env.NEXT_PUBLIC_API_URL if configured (trimming any trailing slashes).
 * 2. In browser environments without NEXT_PUBLIC_API_URL, derives `http://${window.location.hostname}:3001`.
 * 3. In SSR or test environments, falls back to `http://localhost:3001`.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
}

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

export interface FetchWithTimeoutOptions extends RequestInit {
  retryOnColdStart?: boolean;
}

const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds default
const COLD_START_TIMEOUT_MS = 45000; // 45 seconds for cold start retry
export const AI_REQUEST_TIMEOUT_MS = 25000; // 25 seconds for AI inference requests (parse prompt, chat, vision)

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  // Safe default: only idempotent GET requests are eligible for a single cold-start retry
  const canRetry = options.retryOnColdStart ?? (method === 'GET');
  const maxAttempts = canRetry ? 2 : 1;

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    const currentTimeout = attempt > 1 ? COLD_START_TIMEOUT_MS : timeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort(new Error(`Request timed out after ${currentTimeout}ms`));
    }, currentTimeout);

    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      // Render free-tier returns 502, 503, or 504 while waking up the spin-down container
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxAttempts) {
        clearTimeout(timer);
        // Wait 2 seconds before the single retry
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      clearTimeout(timer);
      return res;
    } catch (err: any) {
      clearTimeout(timer);
      const isAbortOrNetwork =
        err?.name === 'AbortError' ||
        controller.signal.aborted ||
        err?.message?.includes('fetch failed');

      if (isAbortOrNetwork && attempt < maxAttempts) {
        // Wait 2 seconds before the single retry
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      if (err?.name === 'AbortError' || controller.signal.aborted) {
        throw new Error(
          currentTimeout >= 20000
            ? `AI request timed out after ${Math.round(currentTimeout / 1000)}s. The AI service is experiencing high demand. Please try again.`
            : `Connection timed out after ${Math.round(currentTimeout / 1000)}s. The backend may be waking up from sleep. Please try again.`
        );
      }
      throw err;
    }
  }

  throw new Error('Connection failed. Please check your network connection.');
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
  
  const baseUrl = getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/meal/daily?date=${dateStr}`, {
    headers: { Authorization: `Bearer ${token}` },
  }, 10000);

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

export interface UpdateMealPayload {
  foodId?: string;
  meal?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  servingQuantity?: number;
  unitName?: string;
  loggedWeightGrams?: number;
  loggedCaloriesKcal?: number;
  loggedProteinG?: number;
  loggedCarbohydratesG?: number;
  loggedFatG?: number;
}

export async function postLogMeal(payload: LogMealPayload): Promise<ApiMealLogEntry> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetchWithTimeout(`${baseUrl}/meal/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, 10000);

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

export async function updateMealEntry(id: string, payload: UpdateMealPayload): Promise<ApiMealLogEntry> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetchWithTimeout(`${baseUrl}/meal/entry/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, 10000);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    console.error('updateMealEntry error response:', errorData);

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      useAppStore.getState().logout();
    }

    throw new Error(errorData.message || 'Failed to update meal entry');
  }

  return res.json();
}

export async function deleteMealEntry(id: string): Promise<void> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetchWithTimeout(`${baseUrl}/meal/entry/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, 10000);

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

  const baseUrl = getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/progress/weight`, {
    headers: { Authorization: `Bearer ${token}` },
  }, 10000);

  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to fetch weight history');
  }

  return res.json();
}

export async function postWeightLog(weightKg: number): Promise<WeightEntry> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetchWithTimeout(`${baseUrl}/progress/weight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ weightKg }),
  }, 10000);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to log weight');
  }

  return res.json();
}

export async function fetchAdherence(days: number = 7): Promise<AdherenceDay[]> {
  const token = getAuthToken();
  if (!token) return [];

  const baseUrl = getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/progress/adherence?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  }, 10000);

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

  const baseUrl = getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  }, 10000);

  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error('Failed to fetch user profile');
  }

  return res.json();
}

export async function updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetchWithTimeout(`${baseUrl}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, 10000);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return res.json();
}

export type AiProvenanceSource =
  | 'gemini'
  | 'caltrack_data'
  | 'caltrack_local'
  | 'local_fallback'
  | 'hybrid';

export interface AiProvenance {
  source: AiProvenanceSource;
  label: string;
  details?: string;
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
  portionDescription?: string;
  isEstimate?: boolean;
}

export interface AiParseResponse {
  text: string;
  suggestedFood?: AiFoodSuggestion;
  provenance?: AiProvenance;
}

export async function parseAiPrompt(prompt: string): Promise<AiParseResponse> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetchWithTimeout(`${baseUrl}/ai/parse-prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  }, AI_REQUEST_TIMEOUT_MS);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to analyze AI prompt');
  }

  return res.json();
}

export interface CoachChatResponse {
  reply: string;
  provenance?: AiProvenance;
}

export async function sendCoachChat(message: string, date?: string): Promise<CoachChatResponse> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();
  const timeZone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Colombo';

  const res = await fetchWithTimeout(`${baseUrl}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, date, timeZone }),
  }, AI_REQUEST_TIMEOUT_MS);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to send message to AI coach');
  }

  return res.json();
}

export async function scanMealImage(imageBase64: string): Promise<AiParseResponse> {
  const token = getAuthToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetchWithTimeout(`${baseUrl}/ai/scan-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageBase64 }),
  }, AI_REQUEST_TIMEOUT_MS);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Failed to scan meal photo');
  }

  return res.json();
}
