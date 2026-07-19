/**
 * Country wage benchmarks in PPP USD, used ONLY when the user leaves the
 * expected-salary field blank.
 *
 * ## IMPORTANT: these are MEANS, not medians
 *
 * The export is named `medianAnnualWage` because that is what the benchmark
 * module consumes, but the per-country figures below are OECD *average* (mean)
 * annual wages. OECD's `AV_AN_WAGE` publishes only a mean series — its
 * `AGGREGATION_OPERATION` dimension has the single value `MEAN` — and its
 * companion earnings dataset (`DEC_I`) publishes only decile *ratios*, never
 * median wage levels in PPP USD. No genuine median level series was available.
 *
 * Mean wages sit meaningfully above medians because the top tail drags the
 * average up; in most OECD countries the median is roughly 80-85% of the mean.
 * So this table biases the benchmark HIGH, which makes scores computed against
 * it read slightly LOW. Do not present these numbers to users as medians.
 *
 * `GLOBAL_MEDIAN_WAGE_USD` is a true median (ILO), so the fallback path and the
 * per-country path are not measuring the same statistic. This is a known,
 * accepted wart rather than an oversight.
 *
 * ## Second caveat: all-role aggregates
 *
 * Every figure is a whole-economy country aggregate across all occupations,
 * industries and seniority levels. It is a coarse proxy for any individual's
 * market rate — a nurse and a derivatives trader in the same country share one
 * number here. The UI must label the fallback benchmark as approximate.
 *
 * ## Provenance
 *
 * Per-country: OECD "Average annual wages", dataflow
 * `OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE,1.0`, filtered to
 * `UNIT_MEASURE=USD_PPP` (US dollars, PPP converted) and `PRICE_BASE=Q`
 * (constant prices, base period 2025), reference year 2025, all observations
 * flagged `OBS_STATUS=A` (normal value). Retrieved 2026-07-19 from the OECD
 * SDMX API that backs https://data-explorer.oecd.org:
 * https://sdmx.oecd.org/public/rest/data/OECD.ELS.SAE,DSD_EARNINGS@AV_AN_WAGE,1.0/USA+GBR+CAN+AUS+IRL+NZL+DEU+FRA+NLD+ESP+ITA+JPN.......?startPeriod=2022&format=csvfilewithlabels
 *
 * Global fallback: ILO Global Wage Report 2024-25, which states "the world's
 * median wage in 2021 was about US$846 PPP" per month for full-time work.
 * https://www.ilo.org/sites/default/files/2024-11/GWR-2024_Layout_E_RGB_Web.pdf
 *
 * Keys are ISO-3166 alpha-2 and must all exist in `pppFactors` (lib/ppp.ts).
 * Countries with no sourced figure are deliberately absent — callers fall back
 * to `GLOBAL_MEDIAN_WAGE_USD` rather than to an invented number.
 */
export const MEDIAN_WAGE_SOURCE =
  "OECD Average annual wages (AV_AN_WAGE), constant-price PPP USD — mean, not median";
export const MEDIAN_WAGE_YEAR = 2025;

/**
 * Average annual wage per full-time equivalent employee, constant 2025 prices,
 * PPP-converted USD. Values rounded to whole dollars from the OECD series.
 */
export const medianAnnualWage: Record<string, number> = {
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

/**
 * ILO Global Wage Report 2024-25 global median, annualised: US$846 PPP per
 * month for full-time work (2021 global wage distribution) x 12.
 *
 * Unlike the table above this IS a genuine median. Its 2021 reference year is
 * older than the OECD figures, and it is a global all-country median, so it
 * lands far below any high-income country's benchmark.
 */
export const GLOBAL_MEDIAN_WAGE_USD = 10152;
