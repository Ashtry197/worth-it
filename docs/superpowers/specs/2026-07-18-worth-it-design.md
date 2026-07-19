# Worth It — Design Spec

**Date:** 2026-07-18
**Status:** Approved design, pending implementation plan
**Location:** `C:\Users\INSAN\OneDrive\Desktop\Worth it` (WSL: `/mnt/c/Users/INSAN/OneDrive/Desktop/Worth it`)

## Summary

A job-worth calculator that scores whether a job is worth it, accounting for
pay, hours, commute, working conditions, and benefits rather than salary alone.

Ad-free, tracker-free, English-only, and entirely client-side. Deployed as a
static export.

The project takes its formula lineage and PPP dataset from
[Zippland/worth-calculator](https://github.com/Zippland/worth-calculator)
(MIT), but is an independent rebrand with a reworked scoring model. It is not a
fork and does not track upstream.

## Background

The original is a viral Chinese project (3.2k stars, MIT). A source audit found
it clean — no network calls, no data exfiltration, all computation client-side —
but unsuitable for direct reuse:

- Google AdSense, Vercel Analytics, and a third-party Chinese visit counter
  (`busuanzi.ibruce.info`) are wired into the page.
- Scoring assumes the Chinese labour market: state-owned-enterprise and civil
  service employer tiers, company canteen and shuttle-bus coefficients, a
  proximity-to-hometown factor, and PPP normalisation hardcoded to CNY (4.19).
- The calculator is a single 1,677-line component with Chinese comments
  interleaved through the JSX; translations for zh/en/ja add another 1,320 lines.
- Dependencies are stale: Next 15.0.2 and a React 19 *release candidate* pin.
- `@notionhq/client` is declared but never imported — dead dependency.

Roughly 200 of its 4,358 lines survive our requirements, so we scaffold fresh
and port what's worth keeping.

## Goals

- Score a job in a way that is interpretable, not an arbitrary index.
- Work for an English-speaking audience in any country.
- Collect nothing: no analytics, no ads, no network calls of any kind.
- Keep the formula independently readable and testable.
- Deploy as static files with no server and no runtime cost.

## Non-Goals

- Multi-language support. English only. (The original's i18n layer is dropped
  entirely; re-adding it later is a clean-slate decision, not a port.)
- Accounts, saved server-side state, or any backend.
- Tracking upstream changes from the original project.
- Role-level salary data. See "Benchmark" below for how this is sidestepped.

## Scoring Model

### Formula

```
totalComp        = salary + employerHealthcare + pensionMatch
workDaysPerYear  = 52 × workDaysPerWeek − ptoDays
officeDaysRatio  = (workDaysPerWeek − remoteDaysPerWeek) ÷ workDaysPerWeek

adjustedDailyPay = (totalComp ÷ workDaysPerYear) × pppRate(country → USD)
effectiveHours   = workHours + (commute × officeDaysRatio) − 0.5 × restTime
rawHourly        = adjustedDailyPay ÷ effectiveHours

qualityMultiplier = environment × management × colleagues
                    (each 0.8–1.2, centred on 1.0)

score = (rawHourly × qualityMultiplier) ÷ benchmark
```

**Each input is counted exactly once, in the place where it actually acts.**
This is deliberate, and it is where the model departs most from the original:

- **Monetary benefits are monetised.** Employer healthcare contribution and
  pension match are added to `totalComp`, because they are money. They do not
  become a vague multiplier.
- **Time benefits are counted as time.** PTO reduces `workDaysPerYear`, which
  correctly raises the daily rate — 25 days of leave on the same salary *is* a
  higher effective rate. Remote days reduce commute exposure via
  `officeDaysRatio`, and nowhere else.
- **Only genuinely subjective factors remain multipliers**: environment,
  management, colleagues.

An earlier draft had remote days both reducing commute *and* feeding a "perks"
coefficient, which double-counted it, and bundled four unrelated inputs into one
opaque number. Both are fixed above.

**A score of 1.0 means "typical for your market."** Above is good, below is
poor. This is the central design decision: the output is a real-world
comparison, not an index.

### Changes from the original, and why

| Original | Problem | Resolution |
|---|---|---|
| Magic constant `35` in the denominator | Undocumented; made the output an arbitrary index | Replaced by an explicit `benchmark` reference rate, so 1.0 has meaning |
| Divide by education level | Penalises a PhD holding the same job; reads as insulting even though the intent (opportunity cost) is defensible | Removed as a divisor. Education raises the *benchmark* instead — the honest version of the same idea |
| Hardcoded experience/raise curve by employer type | Unexplained multipliers (0.2×, 0.4×) baked into the denominator | Experience and sector feed the `benchmark`. Same information, stated plainly |
| Canteen and shuttle-bus coefficients | Chinese/Japanese corporate norms; noise elsewhere, and modelled as arbitrary multipliers | Replaced by healthcare, pension match, PTO, and remote days — each counted structurally (money as money, time as time) rather than as a coefficient |
| Employer tiers (civil service, SOE, foreign firm, dispatch worker) | China-specific, partly Japanese | Public sector / Non-profit / Large private / Startup / Contract or agency / Self-employed |
| `cityFactor` = proximity to hometown | Encodes a specific migration pattern | Optional metro cost-of-living adjustment — country PPP can't distinguish San Francisco from Ohio |
| PPP anchored to CNY (4.19) | Scores read as Chinese-relative | Anchored to USD; 178-country picker retained |

### Benchmark

`benchmark` is the reference hourly rate the score divides by. Sourcing real
salary data by country × experience × sector is out of scope, so:

**Primary:** one optional field — "what do you think someone in your role
typically earns?" If filled, the score is personal and genuinely meaningful, and
the user owns the assumption rather than trusting our numbers.

**Fallback:** if left blank, a documented per-country median full-time wage,
adjusted by the experience and sector inputs. The fallback's source and
staleness are stated in the UI so the number is never presented as authoritative.

## Architecture

The organising principle: **the formula is pure TypeScript with no React in it.**
The original buried its maths inside a 1,677-line component, which is why it
resists verification and change.

```
worth-it/
├── app/
│   ├── layout.tsx          metadata and fonts; no third-party scripts
│   ├── page.tsx            composes the calculator
│   ├── globals.css
│   └── share/page.tsx      shareable result view
├── components/
│   ├── Calculator.tsx      orchestrator; owns form state
│   ├── form/
│   │   ├── CompensationFields.tsx   salary, healthcare, pension match, country
│   │   ├── TimeFields.tsx           hours/day, days/week, remote days,
│   │   │                            commute, PTO days, rest
│   │   ├── QualityFields.tsx        environment, management, colleagues
│   │   └── BenchmarkField.tsx       optional expected salary
│   ├── ScoreDisplay.tsx    score, rating band, factor breakdown
│   ├── ShareCard.tsx       html-to-image + qrcode
│   └── HistoryList.tsx     saved results
└── lib/
    ├── scoring.ts          pure; the actual product
    ├── ppp.ts              178-country table, ported verbatim
    ├── benchmark.ts        user input with per-country median fallback
    ├── storage.ts          localStorage behind a validating wrapper
    └── types.ts
```

`lib/scoring.ts` accepts an input object and returns a score plus a per-factor
breakdown. `ScoreDisplay` renders that breakdown so users can see which factor
moved their score — the original showed only the final number.

**Stack:** Next.js 15 (latest patch), React 19 stable (not the RC the original
pins), TypeScript, Tailwind. Dependencies carried over: `html-to-image`,
`qrcode`, `lucide-react`. Dropped: `@notionhq/client` (dead),
`@vercel/analytics` (tracking), `html2canvas` (redundant with `html-to-image`).

## Data Flow

Form state lives in `Calculator` and flows down as props. Changes recompute
through `scoring.ts` and render into `ScoreDisplay`.

**Nothing leaves the browser.** No fetch, no analytics, no beacons. This is a
hard constraint, not a default — it is the main reason for the rebuild.

`localStorage` persists country preference and result history through
`storage.ts`, which validates on read.

## Error Handling

- **Denominator collapse.** `effectiveHours` can reach zero or go negative when
  `workHours + commute − 0.5 × restTime ≤ 0`. The original emits `Infinity` or a
  negative score. Clamp to a floor and surface a validation message.
- **Missing salary.** Empty state, never `NaN`.
- **Remote days exceeding work days.** Clamp, matching the original's behaviour.
- **`localStorage` unavailable** (private browsing) or **corrupt JSON.** Caught
  in `storage.ts`; degrade to in-memory rather than throwing.

## Testing

Vitest against `lib/scoring.ts`, since the formula is the product:

- Golden cases: known inputs → expected scores, locking in the model.
- Edge cases: zero hours, absent salary, remote days > work days, extreme rest
  time, denominator collapse.
- `benchmark` resolution: user-supplied value wins; blank falls back to the
  country median.
- No double-counting: raising remote days must change the score only through
  commute exposure, and PTO only through `workDaysPerYear`. Asserted directly,
  since this was a defect in an earlier draft of the model.

Light React Testing Library coverage on form wiring and validation messages.

## Deployment

`next.config.ts` sets `output: 'export'`, producing a static `out/` directory
deployable to GitHub Pages, Cloudflare Pages, Netlify, or any static host. No
environment variables, no server, nothing to patch at runtime.

A GitHub Actions workflow builds and publishes on push.

### OneDrive caveats

The project lives on a OneDrive-synced Desktop path, which has two consequences
documented in the README:

- `node_modules` and `.next` must be excluded in the OneDrive client. Syncing
  tens of thousands of files causes sync storms and file-locking failures during
  builds. `.gitignore` covers them for git, but not for OneDrive.
- `/mnt/c` is slow from WSL because filesystem calls cross the drvfs boundary.
  Fine at this size; if install and hot-reload times become annoying, run Node
  from Windows instead of WSL, where the path is native.

## Licensing and Attribution

The PPP dataset and formula lineage come from an MIT-licensed project. We retain
the original copyright notice for that portion and credit
Zippland/worth-calculator in the README. Our own code carries our own licence.

## Open Questions

None. All design decisions are settled; the next step is the implementation plan.
