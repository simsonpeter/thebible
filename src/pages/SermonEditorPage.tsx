import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { db } from "@/db";
import { useToast } from "@/hooks/useToast";
import { downloadText } from "@/services/backupService";
import { copyText, shareTextFile } from "@/services/shareService";
import {
  deleteSermon,
  formatPassageReference,
  formatSermonDocument,
  moveSermonPassage,
  passageLanguage,
  rememberActiveSermon,
  removeSermonPassage,
  sermonFilename,
  sermonShareTitle,
  translationLabel,
  updateSermon,
  updateSermonPassageNote,
} from "@/services/sermonService";
import { cn, formatSundayLabel } from "@/utils/misc";

export function SermonEditorPage() {
  const { id } = useParams();
  const sermonId = Number(id);
  const navigate = useNavigate();
  const { push } = useToast();
  const sermon = useLiveQuery(async () => {
    if (!Number.isInteger(sermonId) || sermonId < 1) return null;
    return (await db.sermons.get(sermonId)) ?? null;
  }, [sermonId]);
  const passages = useLiveQuery(
    () => (Number.isInteger(sermonId) ? db.sermonPassages.where("sermonId").equals(sermonId).sortBy("order") : []),
    [sermonId],
  ) ?? [];
  const [title, setTitle] = useState("");
  const [sundayDate, setSundayDate] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!sermon) return;
    setTitle(sermon.title);
    setSundayDate(sermon.sundayDate);
    setBody(sermon.body);
  }, [sermon]);

  if (!Number.isInteger(sermonId) || sermonId < 1) {
    return (
      <Page title="Sermon" back>
        <p className="text-sm text-muted">That sermon was not found.</p>
      </Page>
    );
  }

  if (sermon === undefined) {
    return (
      <Page title="Sermon" back>
        <p className="text-sm text-muted">Loading…</p>
      </Page>
    );
  }

  if (sermon === null) {
    return (
      <Page title="Sermon" back>
        <p className="text-sm text-muted">That sermon was not found.</p>
      </Page>
    );
  }

  function persist(patch: { title?: string; sundayDate?: string; body?: string }) {
    void updateSermon(sermonId, patch);
  }

  async function exportSermon(kind: "share" | "copy" | "download") {
    const draft = { title: title.trim() || "Sunday sermon", sundayDate, body };
    await updateSermon(sermonId, draft);
    const document = formatSermonDocument(draft, passages);
    const filename = sermonFilename(draft);
    const shareTitle = sermonShareTitle(draft);
    if (kind === "copy") {
      await copyText(document);
      push("Copied. Paste into Google Drive if you want.", "success");
      return;
    }
    if (kind === "download") {
      downloadText(filename, document);
      push("Downloaded. Upload the file to Google Drive.", "success");
      return;
    }
    const result = await shareTextFile(filename, document, shareTitle);
    if (result === "copied") push("Copied. Paste into Google Drive.", "success");
    if (result === "shared") push("Pick Google Drive in the share sheet.", "success");
  }

  return (
    <Page title="Sermon" subtitle={formatSundayLabel(sundayDate || sermon.sundayDate)} back>
      <label className="mb-3 block text-sm font-semibold">
        Title
        <input
          className="mt-2 min-h-12 w-full rounded-2xl border border-navy/10 px-3 dark:border-white/10 dark:bg-white/5"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => persist({ title: title.trim() || "Sunday sermon" })}
        />
      </label>
      <label className="mb-3 block text-sm font-semibold">
        Sunday
        <input
          type="date"
          className="mt-2 min-h-12 w-full rounded-2xl border border-navy/10 px-3 dark:border-white/10 dark:bg-white/5"
          value={sundayDate}
          onChange={(event) => {
            setSundayDate(event.target.value);
            persist({ sundayDate: event.target.value });
          }}
        />
      </label>
      <label className="mb-4 block text-sm font-semibold">
        Outline and notes
        <textarea
          className="mt-2 min-h-40 w-full rounded-2xl border border-navy/10 p-3 dark:border-white/10 dark:bg-white/5"
          placeholder="Theme, points, illustrations, closing…"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onBlur={() => persist({ body })}
        />
      </label>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          className="flex-1"
          onClick={() => {
            void updateSermon(sermonId, {
              title: title.trim() || "Sunday sermon",
              sundayDate,
              body,
            }).then(() => {
              rememberActiveSermon(sermonId);
              navigate("/bible");
            });
          }}
        >
          Add verses
        </Button>
        <Button variant="gold" className="flex-1" onClick={() => void exportSermon("share")}>
          Share to Drive
        </Button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => void exportSermon("copy")}>
          Copy
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => void exportSermon("download")}>
          Download
        </Button>
      </div>

      <h2 className="mb-3 font-semibold">Scriptures ({passages.length})</h2>
      <div className="grid gap-3">
        {passages.length === 0 ? (
          <p className="text-sm text-muted">Open the Bible, tap a verse, then choose Add to sermon.</p>
        ) : null}
        {passages.map((passage, index) => {
          const language = passageLanguage(passage.translationId);
          return (
            <Card key={passage.id}>
              <p className={cn("text-sm font-semibold", language === "ta" && "tamil")}>
                {formatPassageReference(passage)}
                <span className="ml-2 font-normal text-muted">({translationLabel(passage.translationId)})</span>
              </p>
              <p className={cn("mt-2 whitespace-pre-wrap leading-relaxed", language === "ta" && "tamil")}>
                {passage.text}
              </p>
              <textarea
                className="mt-3 min-h-20 w-full rounded-2xl border border-navy/10 p-3 text-sm dark:border-white/10 dark:bg-white/5"
                placeholder="What you will say about this verse"
                defaultValue={passage.note}
                onBlur={(event) => passage.id && void updateSermonPassageNote(passage.id, event.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-11 rounded-full px-3 text-sm font-semibold"
                  onClick={() =>
                    navigate(
                      `/bible/${passage.bookId}/${passage.chapter}?verse=${passage.verseStart}&translation=${passage.translationId}`,
                    )
                  }
                >
                  Open
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full px-3 text-sm font-semibold disabled:opacity-40"
                  disabled={index === 0}
                  onClick={() => passage.id && void moveSermonPassage(passage.id, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full px-3 text-sm font-semibold disabled:opacity-40"
                  disabled={index === passages.length - 1}
                  onClick={() => passage.id && void moveSermonPassage(passage.id, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full px-3 text-sm font-semibold text-red-700"
                  onClick={() => passage.id && void removeSermonPassage(passage.id)}
                >
                  Remove
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        variant="danger"
        className="mt-8 w-full"
        onClick={() => {
          if (!confirm("Delete this sermon and its verses?")) return;
          void deleteSermon(sermonId).then(() => navigate("/sermons"));
        }}
      >
        Delete sermon
      </Button>
    </Page>
  );
}
