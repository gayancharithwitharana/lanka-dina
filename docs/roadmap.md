# Roadmap

Everything up to the AdMob banner runs in Expo Go. The development build waits until AdMob or release, whichever comes first.

## Next steps

Done: fonts, SQLite with Drizzle, the Nakath tab (Avurudu and Today), day detail notes and reminders, the Reminders screen with local notifications, Sinhala and Tamil translations (the app starts in the phone's language), data files with sources, Rahu kalaya and kala horawa from sunrise and sunset, updates from GitHub Pages without an app release, the official 2027 Avurudu nakath, and the nakath share image.

1. **Tamil review.** A native speaker reviews the Tamil terms in `docs/glossary.md` and the app screenshots (`npm run screenshots:ta`). Add sourced Tamil terms for Maru direction, kala horawa and aya-waya.
2. **Remaining data sources (TODO, before release).** Each one is a data change in `data/`, published without an app release (see `docs/DATA_SOURCES.md`):
   - **Holidays 2026 and 2027:** still `sample-holidays`. Find the official list (Holidays gazette on documents.gov.lk, or the Central Bank's "Bank Holidays" page; both block automated downloads, so get the PDF in a browser), then replace the sample files with `holidays-2026.json` and `holidays-2027.json` at version 2.
   - **Nakath sheet link:** `nakath-2027.json` links to gazette.lk's copy of the Ministry's sheet. Replace it with the Ministry's own URL when one is published, and add Tamil names from the Tamil sheet.
   - **Traditional rules:** cite a reference for the Rahu kalaya parts and horawa order, and complete Maru for all 7 days (`sample-traditional.json`).
   - **Aya-waya:** find a source per year, or hide the card for years without one (`src/data/sample-aya-waya.json` is placeholder).
3. **Development build.** Decide the Android package name first, because it can't change after publishing. Then add AdMob banners (Calendar, Upcoming, Nakath) with Google's test ad IDs.
4. **Release prep.** App icon, splash screen, privacy policy, EAS builds, store listing.

## What needs a development build

| Feature | Expo Go |
| --- | --- |
| Fonts (`expo-font`) | Works |
| SQLite and Drizzle | Works |
| Local notifications | Works (push doesn't, and we don't need it) |
| AdMob banner | Needs a development build |

Test the reminders on a development build before release, because Expo Go doesn't behave exactly like the shipped app.
