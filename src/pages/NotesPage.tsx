import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { NoteCard } from "@/components/notes/NoteCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { db } from "@/db";
import { deleteNote, updateNote } from "@/services/noteService";
import { normalizeForSearch } from "@/utils/text";

export function NotesPage() {
  const rows = useLiveQuery(() => db.notes.orderBy("updatedAt").reverse().toArray(), []) ?? [];
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);
  const navigate = useNavigate();
  const visible = query.trim()
    ? rows.filter((note) => normalizeForSearch(note.text).includes(normalizeForSearch(query)))
    : rows;

  return (
    <Page title="Notes" back>
      <SearchBar value={query} onChange={setQuery} placeholder="Search notes" />
      <div className="mt-4 grid gap-3">
        {visible.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : null}
        {visible.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onOpen={() =>
              navigate(`/bible/${note.bookId}/${note.chapter}?verse=${note.verseNumber}&translation=${note.translationId}`)
            }
            onEdit={() => setEditing({ id: note.id ?? 0, text: note.text })}
            onDelete={() => note.id && void deleteNote(note.id)}
          />
        ))}
      </div>
      <Modal open={Boolean(editing)} title="Edit note" onClose={() => setEditing(null)}>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-navy/10 p-3 dark:bg-white/5"
          value={editing?.text ?? ""}
          onChange={(event) => setEditing((current) => (current ? { ...current, text: event.target.value } : current))}
        />
        <Button
          className="mt-3 w-full"
          onClick={() => {
            if (editing) void updateNote(editing.id, editing.text);
            setEditing(null);
          }}
        >
          Save
        </Button>
      </Modal>
    </Page>
  );
}
