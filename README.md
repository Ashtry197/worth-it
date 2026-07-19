# Worth It

Is your job actually worth it? Scores a job on pay, hours, commute, conditions
and benefits rather than salary alone, and measures it against a market
benchmark. A score of 1.00 means typical for your market.

Everything runs in your browser. There are no ads, no analytics, no trackers,
and no network calls of any kind — a test enforces this.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest
npm run build    # static export to out/
```

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
and only subjective judgements are multipliers.

## What the benchmark actually is

The most meaningful score comes from filling in "typical salary for your role" —
then you are measured against your own market, and you own the assumption.

Left blank, the score falls back to published wage data, and that data is not
uniform. No per-country **median** wage series exists in PPP USD: OECD's
`AV_AN_WAGE` publishes means only. So the fallback uses two different statistics:

| Countries | Source | Statistic | Year |
|---|---|---|---|
| 12 OECD markets | OECD `AV_AN_WAGE` | **mean** | 2025 |
| Everywhere else | ILO Global Wage Report | **median** | 2021 |

Means run roughly 15-20% above medians, so a fallback score in a covered country
is measured against a harder bar than one elsewhere. The two are not strictly
comparable, and the UI labels which yardstick each score used rather than hiding
it. Both are all-role national aggregates — a coarse proxy for any individual.

## Working on OneDrive

This project lives on a OneDrive-synced path. Exclude `node_modules` and
`.next` in the OneDrive client — syncing tens of thousands of files causes
sync storms and file-locking failures during builds. `.gitignore` covers git,
but not OneDrive.

Under WSL, `/mnt/c` is slow because filesystem calls cross the drvfs boundary.
If installs and hot-reload get annoying, run Node from Windows instead.

## Credits

The PPP dataset and the original idea come from
[Zippland/worth-calculator](https://github.com/Zippland/worth-calculator) (MIT).
The scoring model here is a substantial rework — see `NOTICE` and
`docs/superpowers/specs/`.
