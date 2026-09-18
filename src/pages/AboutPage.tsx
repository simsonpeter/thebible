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
        <p>Version 1 does not collect personal data. There is no analytics, advertising, or tracking.</p>
        <p>Accounts, cloud sync, and online quizzes can be added later. Offline reading does not require login.</p>
        <h2 className="mt-4 text-base font-semibold">Bible Information</h2>
        <article className="rounded-3xl bg-white/80 p-4 dark:bg-white/5">
          <h3 className="font-semibold">{LICENSES.bsiOv.name}</h3>
          <p className="mt-2 whitespace-pre-line text-muted">{LICENSES.bsiOv.licenseDetails}</p>
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
