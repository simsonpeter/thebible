import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { db } from "@/db";

export function SavedPage() {
  const navigate = useNavigate();
  const bookmarks = useLiveQuery(() => db.bookmarks.count(), []) ?? 0;
  const highlights = useLiveQuery(() => db.highlights.count(), []) ?? 0;
  const notes = useLiveQuery(() => db.notes.count(), []) ?? 0;
  const sermons = useLiveQuery(() => db.sermons.count(), []) ?? 0;

  return (
    <Page title="Saved" subtitle="Bookmarks, highlights, notes, and sermons stay on this device">
      <div className="grid gap-3">
        <Card onClick={() => navigate("/bookmarks")}>
          <h2 className="font-semibold">Bookmarks</h2>
          <p className="text-sm text-muted">{bookmarks} saved</p>
        </Card>
        <Card onClick={() => navigate("/highlights")}>
          <h2 className="font-semibold">Highlights</h2>
          <p className="text-sm text-muted">{highlights} verses</p>
        </Card>
        <Card onClick={() => navigate("/notes")}>
          <h2 className="font-semibold">Notes</h2>
          <p className="text-sm text-muted">{notes} notes</p>
        </Card>
        <Card onClick={() => navigate("/sermons")}>
          <h2 className="font-semibold">Sermons</h2>
          <p className="text-sm text-muted">{sermons} Sunday notebooks</p>
        </Card>
      </div>
    </Page>
  );
}
