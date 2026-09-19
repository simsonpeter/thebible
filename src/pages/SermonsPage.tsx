import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { db } from "@/db";
import { createSermon, deleteSermon } from "@/services/sermonService";
import { formatSundayLabel } from "@/utils/misc";

export function SermonsPage() {
  const navigate = useNavigate();
  const sermons = useLiveQuery(() => db.sermons.orderBy("sundayDate").reverse().toArray(), []) ?? [];
  const passages = useLiveQuery(() => db.sermonPassages.toArray(), []) ?? [];

  return (
    <Page
      title="Sermons"
      subtitle="Sunday prep stays on this phone. Share or download into Google Drive."
      back
      actions={
        <Button
          variant="gold"
          onClick={() => {
            void createSermon().then((id) => navigate(`/sermons/${id}`));
          }}
        >
          New
        </Button>
      }
    >
      <p className="mb-4 text-sm text-muted">
        Collect verses while you read, write the outline here, then Share and pick Google Drive — the same paste
        workflow, without leaving the Bible.
      </p>
      <div className="grid gap-3">
        {sermons.length === 0 ? <p className="text-sm text-muted">No sermons yet. Start this Sunday&apos;s notes.</p> : null}
        {sermons.map((sermon) => {
          const count = passages.filter((row) => row.sermonId === sermon.id).length;
          return (
            <Card key={sermon.id}>
              <button
                type="button"
                className="w-full text-left"
                onClick={() => sermon.id && navigate(`/sermons/${sermon.id}`)}
              >
                <p className="text-xs tracking-[0.2em] text-gold uppercase">{formatSundayLabel(sermon.sundayDate)}</p>
                <h2 className="mt-2 font-semibold">{sermon.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {count} verse{count === 1 ? "" : "s"}
                  {sermon.body.trim() ? " · notes saved" : ""}
                </p>
              </button>
              <button
                type="button"
                className="mt-3 min-h-11 text-sm font-semibold text-red-700"
                onClick={() => {
                  if (sermon.id && confirm("Delete this sermon and its verses?")) void deleteSermon(sermon.id);
                }}
              >
                Delete
              </button>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
