import { Page } from "@/components/layout/Page";
import { APP_NAME, LICENSES } from "@/data/licenses";

export function PrivacyPage() {
  return (
    <Page title="Privacy Policy" subtitle={APP_NAME} back>
      <article className="grid gap-4 text-sm leading-relaxed">
        <p className="text-lg font-semibold">Your Bible reading data is stored locally.</p>
        <p>{LICENSES.app.privacy}</p>
        <p>
          NJC Bible App does not use analytics, advertising, tracking pixels, or unnecessary external services. Notes,
          bookmarks, highlights, reading history, and reading plans stay on this device in IndexedDB.
        </p>
        <p>
          Bible text is read from files you install locally. English KJV is bundled from a public-domain source. Tamil
          O.V. is bundled from the classic Tamil Old Version files packaged in aruljohn/Bible-tamil, and is not presented
          as authorized BSI New Ortho. The app never uploads verse text, notes, or bookmarks.
        </p>
        <p>Version 1 does not require an account. Offline reading continues without internet access.</p>
        <p>You can export or delete local user data from Settings → Backup.</p>
      </article>
    </Page>
  );
}
