# Worth It

Is your job actually worth it? Your salary is one number in a trade that also
costs you hours, commutes and Sunday evenings. This works out what you actually
earn per hour of your life, then measures it against your market. A score of
**1.00 means typical for your market**.

## No ads, no trackers, no data collection

There are **no adverts**, no analytics, no tracking pixels, and **no network
requests of any kind**. Everything is computed in your browser. Your salary
never leaves your machine — the only thing stored is your country preference,
in `localStorage`, on your own device.

This is not a promise, it is a test. `lib/__tests__/privacy.test.ts` walks the
entire source tree and **fails the build** if `fetch`, `XMLHttpRequest`,
`sendBeacon`, `WebSocket`, `googlesyndication`, `adsbygoogle`, `busuanzi`, or
`@vercel/analytics` appear anywhere in it. The site is a static export, so
there is no server and no logs.

Removing the advertising was the reason this project exists.

## What changed from the original

This is an independent rework of
[Zippland/worth-calculator](https://github.com/Zippland/worth-calculator) (MIT),
a viral Chinese project. It reuses that project's purchasing-power-parity
dataset and the general shape of its formula. It is **not a fork** and shares no
commit history — roughly 200 of the original's 4,358 lines survived.

**Removed entirely**

- Google AdSense, `ads.txt`, and the ad slot components
- Vercel Analytics
- `busuanzi.ibruce.info` — a third-party visit counter loaded on every page
- The Chinese and Japanese translations (this version is English only)
- `@notionhq/client`, a dependency the original declared but never imported

**Reworked in the scoring model**

| Original | Problem | Now |
|---|---|---|
| Magic constant `35` in the denominator | Undocumented, so the output was an arbitrary index | An explicit benchmark rate, so **1.00 has a real meaning** |
| Divided by education level | Penalised a PhD for holding the same job | Education raises the *benchmark* instead — never divides the score |
| Hardcoded raise curve by employer type | Unexplained multipliers (0.2x, 0.4x) baked into the maths | Experience and sector inform the benchmark, stated plainly |
| Canteen and shuttle-bus coefficients | Chinese and Japanese corporate norms, modelled as arbitrary multipliers | Healthcare, pension, paid leave and remote days — each **counted once, where it acts**: money as money, time as time |
| Employer tiers: civil service, SOE, foreign firm, dispatch worker | China-specific, partly Japanese | Public sector / non-profit / large private / startup / contract / self-employed |
| `cityFactor` = proximity to hometown | Encoded one country's migration pattern | Dropped |
| PPP anchored to Chinese yuan (4.19) | Every score read as China-relative | Anchored to **USD**, 179-country picker retained |

**Also**

- Refuses to score rather than guess. Where the original always produced a
  number, this returns a typed error for impossible input and **declines
  entirely** when it has no wage data for your country (see below).
- The formula lives in `lib/scoring.ts` as pure TypeScript with no React in it,
  so it can be read and tested on its own. The original buried it inside a
  1,677-line component.
- Current dependencies: Next 16 and React 19 stable, where the original pinned
  Next 15.0.2 and a React 19 *release candidate*.
- 80 tests, including the privacy guarantee above and regression tests proving
  no input is double-counted.

## How the score works

```
totalComp        = salary + employerHealthcare + pensionMatch
workDaysPerYear  = 52 x workDaysPerWeek - ptoDays
officeDaysRatio  = (workDaysPerWeek - remoteDaysPerWeek) / workDaysPerWeek

adjustedDailyPay = (totalComp / workDaysPerYear) converted to PPP USD
effectiveHours   = workHours + commute x officeDaysRatio - 0.5 x restHours

score = (adjustedDailyPay / effectiveHours) x environment x management
        x colleagues / benchmark
```

Each input is counted exactly once. Money is treated as money, time as time,
and only subjective judgements are multipliers. Paid leave raises your daily
rate because fewer working days for the same salary genuinely is a better rate;
remote days reduce commute exposure and nothing else.

## What the benchmark actually is

The most meaningful score comes from filling in **"typical salary for your
role"**. You are then measured against your own market, and you own the
assumption rather than trusting ours.

Left blank, the score falls back to published national wage data — and only for
the 12 countries where such data exists in PPP USD:

| Countries | Source | Statistic | Year |
|---|---|---|---|
| 12 OECD markets | OECD `AV_AN_WAGE` | **mean** | 2025 |

No per-country *median* wage series exists in PPP USD — OECD's `AV_AN_WAGE`
publishes means only. Means run roughly 15-20% above medians, so this is a
slightly harder bar than a median would be, and the interface says so.

**Outside those 12 countries, the calculator declines to score** and asks for
your own estimate instead. An earlier version fell back to the ILO's *global*
median, which is far below most national medians: a median Polish salary scored
4.79 and displayed "Excellent". A label cannot rescue a number that wrong, so
that fallback was removed rather than caveated.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 80 tests
npm run build    # static export to out/
```

The build output is plain HTML, CSS and JavaScript — host it anywhere, or open
`Worth It.bat` on Windows to build and serve it locally in one click.

## Credits and licence

The PPP conversion-factor dataset and the original idea come from
[Zippland/worth-calculator](https://github.com/Zippland/worth-calculator),
copyright (c) Zippland, used under the MIT Licence — see `NOTICE`. The
underlying PPP figures originate from World Bank data; wage data is from the
OECD.

The reasoning behind the scoring model, including the decisions above and why
each was made, is in `docs/superpowers/specs/`.
