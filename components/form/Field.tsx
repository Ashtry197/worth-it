"use client";

import { useState, type ReactNode } from "react";

/** "" means the user cleared the field, which scores as a missing value.
 *  Anything unparseable yields NaN, which lib/scoring.ts rejects with a
 *  typed "invalid-number" error rather than scoring garbage. */
function parseDraft(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : Number(trimmed);
}

export function NumberField({
  label, hint, value, onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  // The field owns its in-progress text. A controlled <input type="number">
  // cannot: the browser sanitises incomplete values like "1." or "1e" to ""
  // before JavaScript sees them, which reads as "cleared", emits 0, and then
  // stomps the user's typing on the next render — so "1.5" typed by hand
  // becomes 0, then 05. type="text" with inputMode="decimal" keeps the
  // numeric keypad on mobile without the sanitisation.
  const [draft, setDraft] = useState(() => String(value));

  // Re-sync during render rather than in an effect, per React's
  // "You Might Not Need an Effect": tracking the previous prop lets us
  // adjust state as we render, so there is no frame where a stale draft
  // is painted and then corrected. Fires only when the parent changed the
  // value for reasons other than our own typing, so external resets land
  // while ordinary typing is never overwritten.
  // Object.is, not ===, so a NaN draft matches a NaN value.
  const [lastValue, setLastValue] = useState(value);
  if (!Object.is(lastValue, value)) {
    // Track the prop unconditionally, even when the change came from our own
    // typing — otherwise lastValue goes stale and a later reset back to it
    // would look like "no change" and be ignored.
    setLastValue(value);
    if (!Object.is(parseDraft(draft), value)) {
      setDraft(Number.isFinite(value) ? String(value) : "");
    }
  }

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      <input
        type="text"
        inputMode="decimal"
        className="mt-1 w-full rounded border px-2 py-1"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(parseDraft(e.target.value));
        }}
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="mt-1 w-full rounded border px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
