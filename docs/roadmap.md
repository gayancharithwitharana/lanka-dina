# Roadmap

Everything up to the AdMob banner runs in Expo Go. The development build waits until AdMob or release, whichever comes first.

## Next steps

1. **Fonts.** Load Inter, Noto Sans Sinhala and Noto Sans Tamil with `expo-font`, and switch the font with the language.
2. **SQLite with Drizzle.** Move holidays into the database. Add the `notes` and `reminders` tables from the data model in `CLAUDE.md`.
3. **Day detail actions.** Add a note ("My note") and set a reminder from the day screen.
4. **Reminders screen.** Automatic toggles (every Poya day, long weekends), the scheduled list, and local notifications through `expo-notifications`.
5. **Translations.** Fill `src/locales/si.json` and `src/locales/ta.json`.
6. **Real holiday data.** Choose the official gazette source and replace `sample-holidays`.
7. **Development build.** Decide the Android package name first, because it can't change after publishing. Then add the AdMob banner with Google's test ad IDs.
8. **Release prep.** App icon, splash screen, privacy policy, EAS builds, store listing.

## What needs a development build

| Feature | Expo Go |
| --- | --- |
| Fonts (`expo-font`) | Works |
| SQLite and Drizzle | Works |
| Local notifications | Works (push doesn't, and we don't need it) |
| AdMob banner | Needs a development build |

Test the reminders on a development build before release, because Expo Go doesn't behave exactly like the shipped app.
