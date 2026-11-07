@AGENTS.md

# Lankadina — Sri Lankan calendar app

Android-first calendar of Sri Lankan public, bank, mercantile holidays and Poya days.
Reference mockups: the `design/*.dc.html` files (HTML mockups, 390×844). Match layout, spacing and colors; do not copy their markup.

## Stack

- Expo (default template, TypeScript, Expo Router), development build (not Expo Go)
- Styling: NativeWind v4 with tailwindcss@^3.4.17. Design tokens live in `tailwind.config.js`; use `className`, not StyleSheet, for new UI
- expo-sqlite with Drizzle ORM: holidays + user notes/reminders stored on device
- i18next (react-i18next) for translations
- State: React state/context first; add Zustand only if shared state gets painful
- expo-notifications: local reminders
- react-native-google-mobile-ads: AdMob banner. Use Google's TEST ad unit IDs only until release
- i18n: English (default), Sinhala, Tamil. Store all UI strings in `src/locales/{en,si,ta}.json`; missing Sinhala/Tamil keys fall back to English
- No backend. Holiday data ships as bundled JSON; later fetched from a remote JSON file for updates

## Design tokens

- Light and dark palettes live in `src/constants/colors.js`; mockups are `design/*.dc.html` (light) and `design/*Dark.dc.html` (dark)
- Use semantic class names (`bg-background`, `text-text-muted`, `bg-inverse text-on-inverse`); never hardcode colors or `text-white` in components
- Colors outside `className` (tab bar, icon tints, navigation theme) come from `useThemeColors()`
- Today circle, selected chips and primary buttons: `bg-inverse` with `text-on-inverse`; selected segment: `bg-elevated`
- Font: Inter; Noto Sans Sinhala and Noto Sans Tamil for those languages (load via expo-font)
- Radius: cards 14, pills 999, buttons 14. Touch targets ≥ 44
- Section labels: 13px, 600, uppercase, letter-spacing 0.06em, muted

## Navigation

Bottom tabs: Calendar, Upcoming, Reminders, Settings. Day detail is a stack screen pushed from Calendar/Upcoming.

## Screens

1. Calendar (month view): month/year header with prev/next; 7-column grid, week starts Sunday (setting); dots under holiday (accent) and Poya (amber) dates; legend; "This month" list of holiday cards. AdMob banner above tab bar.
2. Day detail: large date, holiday name (Poya in amber), type pills (Public/Bank/Mercantile), Poya timing card (begins/ends), About text, My note. Buttons: Set reminder, Add note. No ad.
3. Upcoming: filter chips (All / Poya / Holidays), list grouped by month with "In N days" countdown. AdMob banner above tab bar.
4. Reminders: automatic toggles (Every Poya day — evening before 7:00 PM; Long weekends — 2 weeks ahead), scheduled reminders list, + button to add. No ad.
5. Settings: language segmented control (English / සිංහල / தமிழ்), week starts on (Sunday/Monday), Notifications, Remove ads (coming soon), Holiday data updated date, Privacy policy. No ad.

## Data model (SQLite)

- holidays(id, date TEXT ISO, name_en, name_si, name_ta, type: 'poya'|'public', is_public, is_bank, is_mercantile, poya_start, poya_end, about_en, about_si, about_ta)
- notes(id, date, text, updated_at)
- reminders(id, holiday_id NULL, date, time, kind: 'auto'|'custom', enabled)

## Testing

- `npm run check` runs typecheck, lint and Jest; it must pass before any commit. CI runs the same on every PR
- Tests live in `__tests__/` (never inside `src/app/`, where every file is a route). Jest config and mocks live in `jest/`
- Test behavior through what users see: query by role, label or text, not by styles or test IDs
- Screen tests use `renderRouter` from `expo-router/testing-library` with the real `src/app` routes; the tabs layout is swapped for `<Slot />` because native tabs render every tab at once
- `__tests__/project-rules.test.ts` enforces: no hardcoded colors or English UI text in `src/`, matching light/dark tokens, and Sinhala/Tamil keys that exist in English
- Every bug fix comes with a test that fails without the fix
- End-to-end: `npm run e2e` runs the Maestro flows in `.maestro/` on the booted iOS simulator through Expo Go. Metro must be running on port 8081. Each flow starts with `subflows/open-route.yaml` (fresh launch, then deep link) and ends with `subflows/assert-no-errors.yaml`. Screenshots land in `.maestro/output/` (gitignored)

## Rules

- Holiday data must come from the official gazette; never invent dates
- Until the gazette source is decided, the app uses sample holidays from a file named `sample-holidays`. Replace it before release
- Keep the app fully usable offline
- Android package: com.yourname.lankadina (decide before first build; permanent after publishing)
