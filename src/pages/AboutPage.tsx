import { Page } from "@/components/layout/Page";
import { APP_NAME, APP_VERSION, LICENSES } from "@/data/licenses";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function AboutPage() {
  const translations = useLiveQuery(() => db.translations.toArray(), []) ?? [];
  return (
    <Page title="About" subtitle={APP_NAME} back>
      <div className="grid gap-4 text-sm leading-relaxed">
        <p className="text-lg font-semibold">{APP_NAME}</p>
        <p>Version {APP_VERSION}</p>
        <p>{LICENSES.app.privacy}</p>
        <p>There is no advertising. Offline reading continues without login.</p>
        <p>Sign in from More → Account sync with the same NJC Church App email to keep notes and reading on every device.</p>
        <h2 className="mt-4 text-base font-semibold">Bible Information</h2>
        <article className="rounded-3xl bg-white/80 p-4 dark:bg-white/5">
          <h3 className="font-semibold">{LICENSES.bsiOv.name}</h3>
          <p className="mt-2 whitespace-pre-line text-muted">{LICENSES.bsiOv.licenseDetails}</p>
        </article>
        <article className="rounded-3xl bg-white/80 p-4 dark:bg-white/5">
          <h3 className="font-semibold">{LICENSES.tanglish.name}</h3>
          <p className="mt-2 whitespace-pre-line text-muted">{LICENSES.tanglish.licenseDetails}</p>
        </article>
        <article className="rounded-3xl bg-white/80 p-4 dark:bg-white/5">
          <h3 className="font-semibold">{LICENSES.strongs.name}</h3>
          <p className="mt-2 whitespace-pre-line text-muted">{LICENSES.strongs.licenseDetails}</p>
        </article>
        {translations.map((translation) => (
          <article key={translation.id} className="rounded-3xl bg-white/80 p-4 dark:bg-white/5">
            <h3 className="font-semibold">
              {translation.name} {translation.isDemo ? "(DEMO)" : ""}
            </h3>
            <p className="mt-1">{translation.license}</p>
            <p className="mt-2 text-muted">{translation.licenseDetails}</p>
            <p className="mt-2 text-xs text-muted">{translation.source}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}
