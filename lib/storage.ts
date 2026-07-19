export interface SavedResult {
  id: string;
  at: number;
  score: number;
  country: string;
  salary: number;
}

const HISTORY_KEY = "worthit:history";
const COUNTRY_KEY = "worthit:country";
const MAX_HISTORY = 20;
const DEFAULT_COUNTRY = "US";

/** Every access is guarded: private browsing and quota limits make these
 *  calls genuinely throwable, and a calculator must not die over a cache. */
function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore — history is a convenience, not a requirement */
  }
}

function isSavedResult(v: unknown): v is SavedResult {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.at === "number" &&
    typeof r.score === "number" &&
    typeof r.country === "string" &&
    typeof r.salary === "number"
  );
}

export function loadHistory(): SavedResult[] {
  const raw = readRaw(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedResult);
  } catch {
    return [];
  }
}

export function saveResult(result: SavedResult): void {
  const next = [result, ...loadHistory()]
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_HISTORY);
  writeRaw(HISTORY_KEY, JSON.stringify(next));
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function loadCountry(): string {
  const raw = readRaw(COUNTRY_KEY);
  return raw && /^[A-Z]{2}$/.test(raw) ? raw : DEFAULT_COUNTRY;
}

export function saveCountry(country: string): void {
  writeRaw(COUNTRY_KEY, country);
}
