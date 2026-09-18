# NJC Bible App

Offline-first Tamil and English Bible reader. Version 1 stores everything locally in IndexedDB. There is no backend, no analytics, and no account requirement.

**NJC Bible App** • தமிழ் வேதாகமம் • English Bible

## Translations

| ID | Name | Status |
| --- | --- | --- |
| `kjv` | King James Version | Public-domain text is bundled at `bible-data/kjv/kjv.json` and imported on first launch. It is not downloaded from the internet at runtime. |
| `bsi-ov` | BSI Tamil O.V. (New Ortho) | **Not bundled.** Import an authorized dataset you legally obtained. Fill copyright/permission text in `src/config/bibleLicenses.ts`. |

NJC Bible App never invents verses, never scrapes websites, and never presents sample or placeholder text as Scripture.

## How to run

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## How to test

```bash
npm test
```

## Production build (PWA)

```bash
npm run build
npm run preview
```

The production build registers a service worker, caches the app shell, fonts, icons, and Bible data files, and can be installed on phones.

## How to import authorized Bible data

Use **Settings → Bible Data**. JSON, CSV, and TXT are accepted. JSON is recommended.

```json
{
  "translation": "BSI Tamil O.V.",
  "language": "ta",
  "books": [
    {
      "id": "genesis",
      "name": "ஆதியாகமம்",
      "englishName": "Genesis",
      "chapters": [
        {
          "chapter": 1,
          "verses": [{ "verse": 1, "text": "..." }]
        }
      ]
    }
  ]
}
```

Rules:

- Canonical book ids must match the 66-book Protestant catalog (`genesis` … `revelation`).
- Full production imports must contain exactly 66 books.
- Duplicate books/chapters/verses and empty verse text are rejected.
- Scripture text is stored exactly as supplied.
- A development-only sample lives at `bible-data/bsi-ov/sample.json` and is marked **SAMPLE DATA ONLY**. Do not treat it as BSI Scripture.
- Do not place copyrighted BSI text in `bible-data/bsi-ov/bsi-ov.json` unless you are authorized to bundle it.

KJV file: `bible-data/kjv/kjv.json` (converted from the public-domain source in `public/data/kjv-source.json`).

## Known limitations

- Tamil BSI O.V. is unavailable until an authorized import. KJV reading, search, bookmarks, notes, plans, and daily verse still work offline.
- Cloud sync, Google/email login, and online quiz leaderboards are architected but not implemented.
- PWA install prompts depend on the browser.
- Screen wake lock depends on browser support.

## Hosted PWA

Production URL: [https://thebible-five.vercel.app/](https://thebible-five.vercel.app/)

## Android APK (Bubblewrap)

The Play-style wrapper lives in `android-twa/`. It opens the Vercel PWA as a Trusted Web Activity, with WebView fallback.

```bash
npm run apk
```

That command needs JDK 17 and an Android SDK. The signed APK is written to `android-twa/app-release-signed.apk`. Keep `android.keystore` private; it is gitignored.

Host Digital Asset Links at `https://thebible-five.vercel.app/.well-known/assetlinks.json` so Android can verify the TWA and hide the browser chrome.

## Future architecture

- Accounts: `src/features/accounts/architecture.ts` and `src/quiz/`
- Quiz: `src/quiz/` plus `src/features/quiz/architecture.ts`

Offline reading must remain available without login.
