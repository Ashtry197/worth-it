import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadHistory, saveResult, clearHistory, loadCountry, saveCountry, type SavedResult,
} from "@/lib/storage";

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const entry = { id: "a", at: 1, score: 1.2, country: "US", salary: 60_000 };

describe("history", () => {
  it("returns an empty list when nothing is stored", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("round-trips a saved result", () => {
    saveResult(entry);
    expect(loadHistory()).toEqual([entry]);
  });

  it("keeps the newest entries first", () => {
    saveResult({ ...entry, id: "a", at: 1 });
    saveResult({ ...entry, id: "b", at: 2 });
    expect(loadHistory().map((e) => e.id)).toEqual(["b", "a"]);
  });

  it("caps history at 20 entries", () => {
    for (let i = 0; i < 25; i++) saveResult({ ...entry, id: String(i), at: i });
    expect(loadHistory()).toHaveLength(20);
  });

  it("recovers from corrupt JSON instead of throwing", () => {
    window.localStorage.setItem("worthit:history", "{not json");
    expect(loadHistory()).toEqual([]);
  });

  it("discards entries with the wrong shape", () => {
    window.localStorage.setItem("worthit:history", JSON.stringify([{ nope: 1 }]));
    expect(loadHistory()).toEqual([]);
  });

  it("clears history", () => {
    saveResult(entry);
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it("degrades quietly when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveResult(entry)).not.toThrow();
  });

  it("degrades quietly when the entry cannot be serialised", () => {
    // JSON.stringify is an argument expression, so it runs outside the
    // write guard. A circular reference must not escape saveResult.
    const circular = { ...entry } as SavedResult & { self?: unknown };
    circular.self = circular;
    expect(() => saveResult(circular)).not.toThrow();
  });
});

describe("country preference", () => {
  it("defaults to US", () => {
    expect(loadCountry()).toBe("US");
  });

  it("round-trips a country", () => {
    saveCountry("GB");
    expect(loadCountry()).toBe("GB");
  });

  it("rejects a malformed stored country", () => {
    window.localStorage.setItem("worthit:country", "not-a-code");
    expect(loadCountry()).toBe("US");
  });
});
