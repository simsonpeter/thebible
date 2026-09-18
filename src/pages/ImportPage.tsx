import { useEffect, useState } from "react";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { importBiblePayload, type ImportProgress } from "@/services/bibleImport";
import { parseBibleFile } from "@/lib/BibleImporter";
import { validateBibleImport } from "@/services/bibleValidation";
import type { BibleImportFile, ValidationResult } from "@/types/bible";
import { useToast } from "@/hooks/useToast";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function ImportPage() {
  const { push } = useToast();
  const kjv = useLiveQuery(() => db.translations.get("kjv"));
  const bsi = useLiveQuery(() => db.translations.get("bsi-ov"));
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [payload, setPayload] = useState<BibleImportFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [partial, setPartial] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const kjvInstalled = Boolean(kjv && kjv.verseCount > 0);
  const bsiInstalled = Boolean(bsi && !bsi.isDemo && bsi.verseCount > 0);

  function onFile(file: File) {
    setFileError(null);
    setResult(null);
    setPayload(null);
    setProgress({ stage: "Reading file...", percent: 8 });
    void file
      .text()
      .then((text) => {
        setProgress({ stage: "Validating...", percent: 22 });
        const parsed = parseBibleFile(file.name, text);
        const check = validateBibleImport(parsed, {
          allowPartial: partial,
          allowPlaceholders: Boolean(parsed.translation?.isDemo),
        });
        setPayload(parsed);
        setResult(check);
        setProgress(null);
      })
      .catch((error: unknown) => {
        setProgress(null);
        setFileError(error instanceof Error ? error.message : "Invalid Bible file.");
      });
  }

  useEffect(() => {
    if (!payload) return;
    setResult(
      validateBibleImport(payload, {
        allowPartial: partial,
        allowPlaceholders: Boolean(payload.translation?.isDemo),
      }),
    );
  }, [partial, payload]);

  return (
    <Page title="Bible Data" subtitle="Import an authorized dataset. Nothing is scraped." back>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        English KJV is bundled from a public-domain source. Tamil BSI O.V. must be imported from a dataset you are
        legally authorized to use. JSON is recommended; CSV and TXT are also accepted.
      </p>
      <div className="mb-4 rounded-3xl bg-white/80 p-4 text-sm dark:bg-white/5">
        <p className="font-semibold">KJV</p>
        <p className="mt-1">{kjvInstalled ? "Installed" : "Not Installed"}</p>
        {kjvInstalled ? (
          <p className="mt-1 text-muted">
            {kjv?.bookCount} books • {kjv?.verseCount.toLocaleString()} verses
          </p>
        ) : null}
        <p className="mt-4 font-semibold">BSI Tamil O.V.</p>
        <p className="mt-1">{bsiInstalled ? "Installed" : "Not Installed"}</p>
        {!bsiInstalled ? (
          <p className="mt-2 text-muted">
            BSI Tamil O.V. Bible data has not been installed. Import an authorized BSI Tamil O.V. dataset from Settings
            → Bible Data.
          </p>
        ) : (
          <p className="mt-1 text-muted">
            {bsi?.bookCount} books • {bsi?.verseCount.toLocaleString()} verses
          </p>
        )}
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={partial} onChange={(event) => setPartial(event.target.checked)} />
        Allow partial imports (less than 66 books)
      </label>
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-navy px-4 text-sm font-semibold text-white">
        IMPORT BIBLE DATA
        <input
          type="file"
          accept=".json,.csv,.txt,application/json,text/csv,text/plain"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
      {progress ? (
        <div className="mt-4">
          <p className="text-sm">{progress.stage}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy/10">
            <div className="h-full bg-gold" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      ) : null}
      {fileError ? <p className="mt-4 text-sm text-red-700">{fileError}</p> : null}
      {result ? (
        <div className="mt-5 rounded-3xl bg-white/80 p-4 text-sm dark:bg-white/5">
          <p>
            {result.bookCount} books • {result.chapterCount} chapters • {result.verseCount.toLocaleString()} verses
          </p>
          {result.errors.map((issue) => (
            <p key={`${issue.code}-${issue.message}`} className="mt-2 text-red-700">
              {issue.message}
            </p>
          ))}
          {result.warnings.map((issue) => (
            <p key={`${issue.code}-${issue.message}`} className="mt-2 text-amber-700">
              {issue.message}
            </p>
          ))}
          <Button
            className="mt-4"
            disabled={!result.ok || !payload || busy}
            onClick={() => {
              if (!payload) return;
              setBusy(true);
              void importBiblePayload(
                payload,
                {
                  allowPartial: partial,
                  allowPlaceholders: Boolean(payload.translation.isDemo),
                },
                setProgress,
              )
                .then((imported) => {
                  push(
                    `${imported.translation.name}: ${imported.translation.bookCount} books, ${imported.translation.verseCount.toLocaleString()} verses`,
                    "success",
                  );
                })
                .catch((error: unknown) =>
                  push(error instanceof Error ? error.message : "Unable to import Bible.", "error"),
                )
                .finally(() => setBusy(false));
            }}
          >
            Import
          </Button>
        </div>
      ) : null}
    </Page>
  );
}
