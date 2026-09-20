# NJC Bible App

Offline-first Tamil and English Bible reader. Reading works without an account. Sign in with the same NJC Church App email to sync notes, bookmarks, highlights, sermons, reading history, and reading plans across devices.

**NJC Bible App** • தமிழ் வேதாகமம் • English Bible

## Translations

| ID | Name | Status |
| --- | --- | --- |
| `kjv` | King James Version | Public-domain text is bundled at `bible-data/kjv/kjv.json` and imported on first launch. It is not downloaded from the internet at runtime. |
| `bsi-ov` | Tamil Bible (Old Version) | Bundled from the per-book JSON files in [aruljohn/Bible-tamil](https://github.com/aruljohn/Bible-tamil). Labeled as classic Tamil O.V., **not** authorized BSI New Ortho. |
| `tanglish` | Tanglish (Tamil Romanised) | Bundled from the TAMRB modules in [yesudas/all-bible-databases Tanglish](https://github.com/yesudas/all-bible-databases/tree/main/Bibles/Tamil-Bible-Database-and-Software-Modules/Tanglish). Latin-script Tamil wording, **not** authorized BSI New Ortho. |
| `thngv` | Hebrew Names of God Version (Tamil) | Bundled from [yesudas/tamil-bible-hebrew-names-of-god-version](https://github.com/yesudas/tamil-bible-hebrew-names-of-god-version). Public-domain THNGV restored by Pastor Paul Jonathan from the 1871 Henry Bower Tamil text. **Not** authorized BSI New Ortho. |
| `sv` | Statenvertaling (1637) | Bundled from [seven1m/open-bibles](https://github.com/seven1m/open-bibles) `dut-statenvertaling.zefania.xml`. Public-domain classic Dutch Statenvertaling. **Not** the copyrighted Herziene Statenvertaling (HSV). |

## Study tools

| ID | Name | Status |
| --- | --- | --- |
| Strong's | ஸ்ட்ராங்க்ஸ் அகராதி | Bundled from [yesudas/strongs-dictionary-in-tamil](https://github.com/yesudas/strongs-dictionary-in-tamil). Offline Hebrew and Greek Strong's lookup in Tamil. A study aid, not Scripture. |
| Brief commentary | வேதாகமம் சுருக்கவுரை | Book list from [yesudas/good-news-brief-commentary](https://github.com/yesudas/good-news-brief-commentary). Public-domain Good News Tamil brief commentary page scans. A study aid, not Scripture. |
| Full commentary | வேதாகமம் விரிவுரை | Chapter catalog from [yesudas/good-news-tamil-bible-commentary](https://github.com/yesudas/good-news-tamil-bible-commentary). Public-domain Good News Tamil full commentary page scans. A study aid, not Scripture. |

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
  "translation": "Tamil Bible (Old Version)",
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
- The bundled Tamil file is `bible-data/bsi-ov/bsi-ov.json` (classic Tamil O.V. from aruljohn/Bible-tamil).
- A development-only sample lives at `bible-data/bsi-ov/sample.json` and is marked **SAMPLE DATA ONLY**.
- Do not replace that bundled file with BSI Tamil O.V. New Ortho unless you are authorized to distribute it.

KJV file: `bible-data/kjv/kjv.json` (converted from the public-domain source in `public/data/kjv-source.json`).

## Known limitations

- Sign-in uses the NJC Church App Firebase project (`songbook-add54`). Add `thebible-five.vercel.app` and `localhost` under Firebase Authentication → Authorized domains if login shows an unauthorized-domain error.
- Online quiz leaderboards are not implemented.
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

- Accounts: `src/hooks/useAuth.tsx` and `src/services/syncService.ts` (NJC Church App Firebase)
- Quiz: `src/quiz/` plus `src/features/quiz/architecture.ts`

Offline reading must remain available without login.
