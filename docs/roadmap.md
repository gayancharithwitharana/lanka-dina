# Roadmap

Goal: Lankadina in the Google Play store before Avurudu, Apr 14, 2027.

## Done

Fonts, SQLite with Drizzle, the Nakath tab (Avurudu and Today), day detail notes and reminders, the Reminders screen with local notifications, Sinhala and Tamil translations (the app starts in the phone's language), data files with sources, Rahu kalaya and kala horawa from sunrise and sunset, updates from GitHub Pages without an app release, the official 2027 Avurudu nakath, the nakath share image, the development build (app ID `com.gayanwitharana.lankadina`, iOS simulator), and AdMob test banners on Calendar, Upcoming and Nakath with the consent step.

## Build next

1. **Release prep in the app.**
   - App icon and splash screen (both are still the Expo template's).
   - Privacy policy page on the GitHub Pages site, and the "Privacy policy" row in Settings.
   - Real AdMob IDs: the app IDs in `app.json` and the banner unit in `src/ads/ad-units.ts` (needs the AdMob account).
2. **First Android run.** The app is Android-first and hasn't run on Android yet.
   - Declare the exact-alarm permission, so reminders fire on time. Android 14 and later deny it by default, so pick the permission approach and test it on a real phone.
   - Check the share image, the fonts and the ad banner on Android.
3. **Cloud and store builds.** `eas.json` with development, preview and production profiles. Needs the Expo account.

## Needs you

- **Official holiday data.** Download the 2026 and 2027 lists in a browser (the Central Bank's "Bank Holidays" page or the Holidays gazette on documents.gov.lk; both block automated downloads). See "Remaining data sources" below.
- **Tamil review.** A native speaker reviews the Tamil terms in `docs/glossary.md` and the app screenshots (`npm run screenshots:ta`). Add sourced Tamil terms for Maru direction, kala horawa and aya-waya.
- **Accounts:**

  | Account | Cost | Needed for |
  | --- | --- | --- |
  | Expo | Free | Cloud builds, a build on a real phone, store builds (`eas login`) |
  | Google Play developer | US$25 once | Publishing on Android |
  | AdMob | Free | The real app and ad unit IDs. Set up the consent and tracking messages under "Privacy & messaging" |
  | Apple Developer Program | US$99 a year | Only for an iOS release |

- **12 testers for the Play closed test** (see the deadline below).
- **Store listing:** description, screenshots, and the "contains ads" and data safety forms.

## Play Store deadline

A new personal Play account must run a closed test with at least 12 testers, opted in for 14 days in a row, before it can apply for production access. Review then usually takes up to 7 days.

| By | What |
| --- | --- |
| January 2027 | Open the Play account and find 12 testers |
| Mid-February 2027 | Start the closed test with a release build |
| Early March 2027 | Apply for production access |
| Before Apr 14, 2027 | Live in the store |

## Remaining data sources

Each one is a data change in `data/`, published without an app release (see `docs/DATA_SOURCES.md`). All of them are needed before release.

- **Holidays 2026 and 2027:** still `sample-holidays`. Replace the sample files with `holidays-2026.json` and `holidays-2027.json` at version 2, from the official list.
- **Nakath sheet link:** `nakath-2027.json` links to gazette.lk's copy of the Ministry's sheet. Replace it with the Ministry's own URL when one is published, and add Tamil names from the Tamil sheet.
- **Traditional rules:** cite a reference for the Rahu kalaya parts and horawa order, and complete Maru for all 7 days (`sample-traditional.json`).
- **Aya-waya:** find a source per year, or hide the card for years without one (`src/data/sample-aya-waya.json` is placeholder).

## Development build

The app runs as its own development build, not in Expo Go.

- **Build:** `npm run ios` builds locally and installs on the iOS simulator; free, no accounts. Rebuild only after native changes.
- **Not done yet:** Android, a build on a real phone, and `eas.json`.
