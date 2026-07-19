/**
 * Fallback wage benchmark in PPP USD, used ONLY when the user leaves the
 * expected-salary field blank.
 *
 * `averageAnnualWage` is an OECD **mean**, not a median. OECD's
 * `AV_AN_WAGE` publishes no median variant — its `AGGREGATION_OPERATION`
 * dimension has the single value `MEAN` — and its companion earnings
 * dataset (`DEC_I`) publishes only decile *ratios*, never median wage
 * levels in PPP USD. No genuine per-country median level series was
 * available from either dataset. Means run roughly 15-20% above medians
 * because the top tail drags the average up, so this table biases the
 * benchmark HIGH, which makes scores computed against it read slightly
 * LOW. Do not present these numbers to users as medians. That caveat
 * applies to the 12 countries below; it has not gone away.
 *
 * This is an all-role, whole-economy country aggregate across all
 * occupations, industries and seniority levels — a coarse proxy for any
 * individual's market rate; a nurse and a derivatives trader in the same
 * country share one number here.
 *
 * Countries absent from this table are **not scored** on the fallback path.
 * There is no honest per-country median to fall back to further, so
 * `resolveBenchmark` (lib/benchmark.ts) returns `null` for them rather than
 * substituting a global figure, and the calculator asks the user for their
 * own estimate instead. See `benchmarkSource` in `ScoreBreakdown`
 * (lib/types.ts) and the `ScoreError` member `"benchmark-unavailable"`.
 *
 * ## Provenance
 *
 * OECD "Average annual wages", dataflow
 * `OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE,1.0`, filtered to
 * `UNIT_MEASURE=USD_PPP` (US dollars, PPP converted) and `PRICE_BASE=Q`
 * (constant prices, base period 2025), reference year 2025, all observations
 * flagged `OBS_STATUS=A` (normal value). Retrieved 2026-07-19 from the OECD
 * SDMX API that backs https://data-explorer.oecd.org:
 * https://sdmx.oecd.org/public/rest/data/OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE,1.0/USA+GBR+CAN+AUS+IRL+NZL+DEU+FRA+NLD+ESP+ITA+JPN.......?startPeriod=2022&format=csvfilewithlabels
 *
 * Keys are ISO-3166 alpha-2 and must all exist in `pppFactors` (lib/ppp.ts).
 * Countries with no sourced figure are deliberately absent — callers decline
 * to score rather than fall back to an invented number.
 */
export const WAGE_SOURCE =
  "OECD Average annual wages (AV_AN_WAGE), constant-price PPP USD — mean, not median";
export const WAGE_YEAR = 2025;

/**
 * Average annual wage per full-time equivalent employee, constant 2025 prices,
 * PPP-converted USD. Values rounded to whole dollars from the OECD series.
 */
export const averageAnnualWage: Record<string, number> = {
  US: 86977, // 86977.138
  GB: 66299, // 66299.139
  CA: 67901, // 67900.601
  AU: 72018, // 72018.439
  IE: 70113, // 70112.825
  NZ: 60896, // 60896.229
  DE: 76285, // 76284.517
  FR: 60483, // 60483.173
  NL: 80136, // 80136.330
  ES: 57779, // 57778.662
  IT: 53864, // 53864.157
  JP: 50183, // 50182.646
};
