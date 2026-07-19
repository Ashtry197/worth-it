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
  label, hint, unit, value, onChange,
}: {
  label: string;
  hint?: string;
  /** What the figure is measured in — "hours", "days", "money per year".
   *  Shown inside the field so the unit is visible while typing, not only
   *  while reading the label. */
  unit?: string;
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
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-graphite">{hint}</span>}
      <span className="relative mt-1.5 block">
        <input
          type="text"
          inputMode="decimal"
          className="tnum w-full rounded-md border border-rule bg-card py-2 pl-3 text-sm text-ink transition-colors hover:border-graphite/60 focus:border-cobalt focus:outline-none"
          style={{ paddingRight: unit ? "5.5rem" : "0.75rem" }}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(parseDraft(e.target.value));
          }}
        />
        {unit && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-graphite"
          >
            {unit}
          </span>
        )}
      </span>
    </label>
  );
}

export function SelectField<T extends string>({
  label, hint, value, options, onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-graphite">{hint}</span>}
      <select
        className="mt-1.5 w-full rounded-md border border-rule bg-card px-3 py-2 text-sm text-ink transition-colors hover:border-graphite/60 focus:border-cobalt focus:outline-none"
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

export function Section({
  title,
  note,
  children,
}: {
  title: string;
  /** A unit or scope that applies to the whole group, so it is stated once
   *  rather than repeated in every field's hint. */
  note?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {/* The rule doubles as the section's ledger line — structure, not decoration. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule pb-2">
        <h2 className="eyebrow text-ink">{title}</h2>
        {note && <p className="text-xs text-graphite">{note}</p>}
      </div>
      <div className="grid gap-5 pt-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
