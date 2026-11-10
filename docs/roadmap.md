# Roadmap

Everything up to the AdMob banner runs in Expo Go. The development build waits until AdMob or release, whichever comes first.

## Next steps

Done: fonts, SQLite with Drizzle, the Nakath tab (Avurudu and Today), day detail notes and reminders, and the Reminders screen with local notifications.

1. **Translations.** Fill `src/locales/si.json` and `src/locales/ta.json`, including nakath, lagna and direction names.
2. **Real data.** Holidays from the official gazette; Avurudu nakath from the Department of Cultural Affairs; verified Maru directions, aya-waya and kala horawa rules. Replace `sample-holidays` and `sample-nakath`.
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
