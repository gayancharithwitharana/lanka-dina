@AGENTS.md

# Lankadina — Sri Lankan calendar app

Android-first app for Sri Lankan public, bank and mercantile holidays, Poya days, and auspicious times (nakath).
Reference mockups: the `design/*.dc.html` files (HTML mockups, 390×844). Match layout, spacing and colors; do not copy their markup.

## Stack

- Expo (default template, TypeScript, Expo Router), development build (not Expo Go)
- Styling: NativeWind v4 with tailwindcss@^3.4.17. Design tokens live in `tailwind.config.js`; use `className`, not StyleSheet, for new UI
- expo-sqlite with Drizzle ORM: holidays, nakath + user notes/reminders stored on device. Schema in `src/db/schema.ts`; after changing it run `npm run db:generate` (migrations in `src/db/migrations` ship with the app and run at startup)
- i18next (react-i18next) for translations
- State: React state/context first; add Zustand only if shared state gets painful
- expo-notifications: local reminders
- react-native-google-mobile-ads: AdMob banner. Use Google's TEST ad unit IDs only until release
- i18n: English (default), Sinhala, Tamil. Store all UI strings in `src/locales/{en,si,ta}.json`; missing Sinhala/Tamil keys fall back to English
- Later: react-native-view-shot + expo-sharing for the nakath share image
- No backend. Holiday and nakath data live in `data/`, ship bundled with the app, and update from GitHub Pages without an app release (see docs/DATA_SOURCES.md). `updateRemoteData` checks `manifest.json` at most hourly on launch and foreground; screens that read data wrap their content in `DataScope`, which remounts it after an update (the React Compiler memoizes data reads)

## Design tokens

- Light and dark palettes live in `src/constants/colors.js`; mockups are `design/*.dc.html` (light) and `design/*Dark.dc.html` (dark)
- Use semantic class names (`bg-background`, `text-text-muted`, `bg-inverse text-on-inverse`); never hardcode colors or `text-white` in components
- Colors outside `className` (tab bar, icon tints, navigation theme) come from `useThemeColors()`
- Today circle, selected chips and primary buttons: `bg-inverse` with `text-on-inverse`; selected segment: `bg-elevated`
- Poya and nakath use the amber/poya token (light #B45309, dark #F59E0B). The Avurudu countdown card and active nakath bells use a poya tint background (light #FFFBEB, dark #3A2A0A); add it as a semantic token if it doesn't exist
- Font: Inter; Noto Sans Sinhala and Noto Sans Tamil for those languages (load via expo-font)
- Radius: cards 14, pills 999, buttons 14. Touch targets ≥ 44
- Section labels: 13px, 600, uppercase, letter-spacing 0.06em, muted

## Navigation

Bottom tabs (5): Calendar, Upcoming, Nakath, Reminders, Settings. Day detail is a stack screen pushed from Calendar/Upcoming.

## Screens

1. Calendar (month view): month/year header with prev/next; 7-column grid, week starts Sunday (setting); dots under holiday (accent) and Poya (amber) dates; legend; "This month" list of holiday cards. AdMob banner above tab bar.
2. Day detail: large date, holiday name (Poya in amber), type pills (Public/Bank/Mercantile), Rahu kalaya + Maru direction cards for that weekday (tap opens Nakath), About text, My note. Buttons: Set reminder, Add note. No ad.
3. Upcoming: filter chips (All / Poya / Holidays), list grouped by month with "In N days" countdown. AdMob banner above tab bar.
4. Nakath: segmented control Avurudu / Today. AdMob banner above tab bar.
   - Avurudu: countdown card to the New Year dawn with a Share button and source line from the year's data (linked when it has a URL); timeline of that year's nakath, entirely from the data (the items and their count change between years). Each row: date, time, name, direction/color detail, and a bell toggle that schedules a reminder.
   - Today: Rahu kalaya card with time range and "Now / Not now" status; Maru direction; current kala horawa; aya-waya card ("Set lagna" prompt, then the user's income/expense numbers for the year).
5. Reminders: automatic toggles (Every Poya day — evening before 7:00 PM; Long weekends — 2 weeks ahead), scheduled reminders list, + button to add. No ad.
6. Settings: language segmented control (English / සිංහල / தமிழ்), week starts on (Sunday/Monday), Notifications, Remove ads (coming soon), Holiday data updated date, Privacy policy. No ad.

## Data model (SQLite)

- holidays(id, date TEXT ISO, name_en, name_si, name_ta, type: 'poya'|'public', is_public, is_bank, is_mercantile, about_en, about_si, about_ta)
- nakath(id, year, sort_order, key, name_en, name_si, name_ta, starts_at, ends_at NULL, direction NULL, color NULL, notes_en, notes_si, notes_ta)
- traditional_rules(id 1, rules JSON): Rahu kalaya parts, day rulers, horawa order, Maru directions and the location (Colombo) from `data/*traditional.json`; Rahu kalaya and kala horawa are calculated from that day's sunrise and sunset (`suncalc`)
- aya_waya(year, lagna, aya, waya)
- data_sources(dataset: 'holidays'|'nakath'|'traditional', year (0 for traditional), version, source_en, source_si, source_ta, source_url, retrieved_at, countdown_key): one row per data file in `data/`; `applyDataFile` replaces that dataset-year when a file has a higher version
- notes(id, date, text, updated_at)
- reminders(id, holiday_id NULL, nakath_id NULL, date, time, kind: 'auto'|'custom', enabled)
- settings: language, week_start, lagna (store wherever settings currently live)

## Testing

- `npm run check` runs typecheck, lint and Jest; it must pass before any commit. CI runs the same on every PR
- Tests live in `__tests__/` (never inside `src/app/`, where every file is a route). Jest config and mocks live in `jest/`; tests run against an in-memory better-sqlite3 database with the real migrations and sample holidays
- Test behavior through what users see: query by role, label or text, not by styles or test IDs
- Screen tests use `renderRouter` from `expo-router/testing-library` with the real `src/app` routes; the tabs layout is swapped for `<Slot />` because native tabs render every tab at once
- `__tests__/project-rules.test.ts` enforces: no hardcoded colors or English UI text in `src/`, matching light/dark tokens, and Sinhala/Tamil keys that exist in English
- Every bug fix comes with a test that fails without the fix
- End-to-end: `npm run e2e` runs the Maestro flows in `.maestro/` on the booted iOS simulator through Expo Go. Metro must be running on port 8081, and Expo Go's floating Tools button must be off (it covers modal Save buttons). Each flow starts with `subflows/open-route.yaml` (fresh launch, switch to English, then deep link) and ends with `subflows/assert-no-errors.yaml`. Run `subflows/allow-notifications.yaml` after any step that can trigger the notification permission prompt. Match times with `.` before AM/PM (iOS formats them with a narrow no-break space). Screenshots land in `.maestro/output/` (gitignored)
- Translation review: `npm run screenshots:si` and `npm run screenshots:ta` screenshot every screen in that language, light and dark, for checking text overflow (flows in `.maestro/review/`, not part of `npm run e2e`)

## Rules

@docs/DATA_SOURCES.md


- Holiday data must come from the official gazette; never invent dates
- Avurudu nakath must come from the Ministry of Buddhasasana, Religious and Cultural Affairs official list; never invent times, directions or colors. Show the source in the app
- Do not copy content from third-party astrology sites
- Until the sources are decided, the app uses sample data from files named `sample-holidays` (and `sample-nakath` for nakath). Replace them before release
- Keep the app fully usable offline
- Android package: com.yourname.lankadina (decide before first build; permanent after publishing)

## Remaining features

- Nakath tab and screen (Avurudu + Today), Rahu kalaya/Maru on Day detail
- Nakath reminders via the bell toggles
- Share image of the nakath list (WhatsApp etc.); before April
