# Roadmap

## Next steps

Done: fonts, SQLite with Drizzle, the Nakath tab (Avurudu and Today), day detail notes and reminders, the Reminders screen with local notifications, Sinhala and Tamil translations (the app starts in the phone's language), data files with sources, Rahu kalaya and kala horawa from sunrise and sunset, updates from GitHub Pages without an app release, the official 2027 Avurudu nakath, the nakath share image, and the development build (app ID `com.gayanwitharana.lankadina`, iOS simulator).

1. **Tamil review.** A native speaker reviews the Tamil terms in `docs/glossary.md` and the app screenshots (`npm run screenshots:ta`). Add sourced Tamil terms for Maru direction, kala horawa and aya-waya.
2. **Remaining data sources (TODO, before release).** Each one is a data change in `data/`, published without an app release (see `docs/DATA_SOURCES.md`):
   - **Holidays 2026 and 2027:** still `sample-holidays`. Find the official list (Holidays gazette on documents.gov.lk, or the Central Bank's "Bank Holidays" page; both block automated downloads, so get the PDF in a browser), then replace the sample files with `holidays-2026.json` and `holidays-2027.json` at version 2.
   - **Nakath sheet link:** `nakath-2027.json` links to gazette.lk's copy of the Ministry's sheet. Replace it with the Ministry's own URL when one is published, and add Tamil names from the Tamil sheet.
   - **Traditional rules:** cite a reference for the Rahu kalaya parts and horawa order, and complete Maru for all 7 days (`sample-traditional.json`).
   - **Aya-waya:** find a source per year, or hide the card for years without one (`src/data/sample-aya-waya.json` is placeholder).
3. **AdMob banners.** `react-native-google-mobile-ads` with Google's test IDs: banners above the tab bar on Calendar, Upcoming and Nakath, with the consent step before ads load. Needs a rebuild of the development build.
4. **Release prep.** App icon, splash screen, privacy policy, EAS builds, store listing.

## Development build

The app runs as its own development build, not in Expo Go. Everything up to AdMob also still works in Expo Go.

- **Build:** `npm run ios` builds locally and installs on the iOS simulator; free, no accounts. Rebuild only after native changes.
- **Not done yet:** Android (untested so far), a build on a real phone, and `eas.json` for cloud and store builds (needs an Expo account).
- **Before release:** test the reminders on a real Android phone. Exact-time reminders need an exact-alarm permission, which Android 14 and later deny by default.
