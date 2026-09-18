import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { db } from "@/db";
import { removeHighlight } from "@/services/highlightService";
import { formatReference } from "@/utils/reference";

export function HighlightsPage() {
  const rows = useLiveQuery(() => db.highlights.orderBy("createdAt").reverse().toArray(), []) ?? [];
  const navigate = useNavigate();
  return (
    <Page title="Highlights" back>
      <div className="grid gap-3">
        {rows.length === 0 ? <p className="text-sm text-muted">Highlight a verse from the Bible reader.</p> : null}
        {rows.map((row) => (
          <Card key={row.verseId}>
            <p className="text-xs capitalize text-gold">{row.color}</p>
            <h3 className="font-semibold">{formatReference(row.bookId, row.chapter, row.verseNumber)}</h3>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="min-h-11 font-semibold"
                onClick={() =>
                  navigate(`/bible/${row.bookId}/${row.chapter}?verse=${row.verseNumber}&translation=${row.translationId}`)
                }
              >
                Open
              </button>
              <button type="button" className="min-h-11 text-red-700" onClick={() => void removeHighlight(row.verseId)}>
                Remove
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}
