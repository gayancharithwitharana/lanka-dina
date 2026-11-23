# Data sources

Where Lankadina's holiday, Poya and nakath data comes from, and how it reaches phones. Never invent or estimate dates or times.

## Public, bank and mercantile holidays (incl. Poya days)

| Priority | Source | Use |
| --- | --- | --- |
| 1 | Holidays gazette (Extraordinary Gazette under the Holidays Act No. 29 of 1971), Ministry of Public Administration, Provincial Councils and Local Government. PDFs on documents.gov.lk | Primary source. The 2027 schedule is already gazetted (25 public and bank holidays) |
| 2 | Central Bank of Sri Lanka, "Bank Holidays for 2027" (cbsl.gov.lk) | Easiest to transcribe. Its B/P/M markers map to `is_bank`, `is_public` and `is_mercantile` |
| 3 | Official government calendar PDF (documents.gov.lk) | Cross-check Poya days |

- A later gazette can amend holidays mid-year (in 2026, the day after Vesak Poya was declared a holiday). Publish the amended year file; phones pick it up without an app release.
- Poya days are dates only. The app doesn't show Poya begin and end times, because no official source publishes them.
- Commercial aggregators (qppstudio, holidaydb, etc.) are sanity checks only, never the source.
- Known fix for the sample data: Tamil Thai Pongal 2027 is **Friday 15 January** (CBSL), not 14 January.

## Avurudu nakath (Sinhala and Tamil New Year auspicious times)

- Source: the official Avurudu Nakath Seettuwa issued by the **Ministry of Buddhasasana, Religious and Cultural Affairs**. The 2027 sheet has already been issued.
- The process is unstable. The Department of Cultural Affairs' committee was disbanded in 2024, and the 2026 sheet only came out on 17 March after a dispute. Some years may have no official sheet.
- The set of nakath changes between years (2026 added "placing the oil pot on the hearth" and times for leaving for urgent duties).

In the app:
- Nakath rows are data per year. Never hardcode the list, the count or the names of items.
- Each year file names the row the Avurudu countdown uses. If that row is missing, the countdown uses the next upcoming nakath.
- If a year has no official sheet, a named astrologer association's table may be used, labeled with its own source and never as official.
- Do not copy tables from third-party astrology websites.

## Rahu kalaya, kala horawa, maru direction, aya-waya

No government body publishes these. They are traditional rules or yearly tables.

- **Rahu kalaya and kala horawa** are calculated on the phone from Colombo sunrise and sunset: the day is split into 8 equal parts with one fixed part per weekday for Rahu kalaya, and planetary hours run from sunrise in a fixed planet order for kala horawa. The rule settings (weekday parts, planet order) live in `traditional.json` with their source, so a better reference only needs a data update. Label them "Calculated from sunrise and sunset · Colombo".
- **Maru direction** uses a fixed direction per weekday from `traditional.json`. Hidden until all 7 days come from a cited reference.
- **Aya-waya** comes from a yearly file per lagna, with its source. Hidden for any year without sourced data. Check whether the official nakath sheet includes it.

## Data files

- The data lives in `data/` in this (public) repository: one file per dataset per year, for example `holidays-2026.json`, `holidays-2027.json`, `nakath-2027.json`, `aya-waya-2027.json`, plus `traditional.json`.
- Every file has `source` (`en`, with optional `si` and `ta`; Sinhala and Tamil fall back to English), `source_url` and `retrieved_at`. Provenance is stored per file, not per row.
- Ids are stable and don't contain the date, for example `2027-thai-pongal`, so a date correction keeps the same row.
- Until real data is entered, the app uses `sample-holidays` and `sample-nakath`. Replace them before release.

## Updates without an app release

- GitHub Pages publishes `data/` together with `manifest.json`, which lists every file and its version, at https://gayancharithwitharana.github.io/lanka-dina/. The `Publish data` workflow runs on every push to `main` that changes `data/`: it validates every file, builds the site with `scripts/build-data-site.mjs` and deploys it. Repository settings → Pages → Source must be "GitHub Actions".
- The app bundles the same files, each with its own version. On launch and when it returns to the foreground (at most once an hour), it fetches the manifest and downloads only files with a higher version than the phone has.
- A downloaded file replaces its whole dataset-year in SQLite in one transaction, so removed holidays disappear. Offline or on any error, the app keeps what it has.
- After an update, notifications are rescheduled. A custom reminder linked to a removed or moved holiday keeps its date and loses the link. A nakath bell reminder is deleted along with its nakath.
- Every data PR runs the app's validation in CI before it can be published (`__tests__/data-folder.test.ts`: each file matches the schema in `src/data/data-file-schema.ts`, is named after its dataset and year, and is bundled with the app). The phone validates downloaded files with the same schema and skips any that don't match.

## How to change data

1. Edit the file in `data/` (on GitHub's website or locally), for example add an amended holiday to `holidays-2027.json`.
2. Increase its `version` by 1, and set `retrievedAt` to the day you read the source. Update `source` and `sourceUrl` if the source changed.
3. Open a PR. CI checks the file; merge when it passes.
4. The `Publish data` workflow deploys it. Phones pick it up the next time the app opens (at most an hour later if it's already open), and reschedule their reminders.

A new year is a new file, for example `holidays-2028.json` at version 1. Import it in `src/data/data-files.ts` in the same PR (CI checks this). Phones already installed download it; the next app release also bundles it.

## Showing sources in the app

- The source name comes from the data file, in the user's language, and links to `source_url` when one exists. Without a source, nothing is shown.
- Settings shows one line per holiday year: source, updated date (`retrieved_at`) and link.
- The Avurudu card shows the nakath year's source.
- Data changes go through `data/`; only new calculations or features need an app release.
