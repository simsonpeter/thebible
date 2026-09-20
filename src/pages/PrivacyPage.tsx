import { Page } from "@/components/layout/Page";
import { APP_NAME, LICENSES } from "@/data/licenses";

export function PrivacyPage() {
  return (
    <Page title="Privacy Policy" subtitle={APP_NAME} back>
      <article className="grid gap-4 text-sm leading-relaxed">
        <p className="text-lg font-semibold">Offline reading does not require an account.</p>
        <p>{LICENSES.app.privacy}</p>
        <p>
          Until you sign in, notes, bookmarks, highlights, reading history, reading plans, and sermons stay on this
          device in IndexedDB. The app does not use advertising or tracking pixels.
        </p>
        <p>
          If you sign in with your NJC Church App email, this Bible app stores your user data under your Firebase user
          in project songbook-add54, in <code>{`users/{uid}/app/state.bibleApp`}</code>. Bible verse text is not
          uploaded except verses you saved into a sermon notebook. Sign-out leaves a copy on this device.
        </p>
        <p>
          English KJV is bundled from a public-domain source. Tamil O.V. is bundled from classic Tamil Old Version files
          packaged in aruljohn/Bible-tamil, and is not presented as authorized BSI New Ortho.
        </p>
        <p>You can export or delete local user data from Settings → Backup.</p>
      </article>
    </Page>
  );
}
