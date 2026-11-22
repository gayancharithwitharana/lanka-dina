# Roadmap

Everything up to the AdMob banner runs in Expo Go. The development build waits until AdMob or release, whichever comes first.

## Next steps

Done: fonts, SQLite with Drizzle, the Nakath tab (Avurudu and Today), day detail notes and reminders, the Reminders screen with local notifications, and Sinhala and Tamil translations (the app starts in the phone's language).

1. **Tamil review.** A native speaker reviews the Tamil terms in `docs/glossary.md` and the app screenshots (`npm run screenshots:ta`). Add sourced Tamil terms for Maru direction, kala horawa and aya-waya.
2. **Real data and updates without app releases.** Plan in `docs/DATA_SOURCES.md`, in stacked PRs:
   1. Data model: a `data_sources` table, no Poya times, reminder link rules, per-file loading that replaces a dataset-year
   2. Rahu kalaya and kala horawa from Colombo sunrise and sunset, rules in `traditional.json`
   3. Remote updates: `manifest.json`, fetching, the GitHub Pages workflow and CI validation
   4. Real data: the 2026 and 2027 gazettes and the 2027 nakath sheet; replace `sample-holidays` and `sample-nakath`
3. **Nakath share image.** `react-native-view-shot` and `expo-sharing`, before April.
4. **Development build.** Decide the Android package name first, because it can't change after publishing. Then add AdMob banners (Calendar, Upcoming, Nakath) with Google's test ad IDs.
5. **Release prep.** App icon, splash screen, privacy policy, EAS builds, store listing.

## What needs a development build

| Feature | Expo Go |
| --- | --- |
| Fonts (`expo-font`) | Works |
| SQLite and Drizzle | Works |
| Local notifications | Works (push doesn't, and we don't need it) |
| AdMob banner | Needs a development build |

Test the reminders on a development build before release, because Expo Go doesn't behave exactly like the shipped app.
