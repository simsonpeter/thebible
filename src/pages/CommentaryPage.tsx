import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { BOOK_CATALOG, getBookById } from "@/data/books";
import {
  adjacentCommentaryBook,
  commentaryBookLabel,
  commentaryPageFallbackUrl,
  commentaryPageUrl,
  loadCommentaryBooks,
  searchCommentaryBooks,
} from "@/services/commentaryService";
import type { CommentaryBook } from "@/types/commentary";

export function CommentaryPage() {
  const { book: bookId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<CommentaryBook[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadCommentaryBooks()
      .then((loaded) => {
        setBooks(loaded);
        setReady(true);
      })
      .catch((cause: Error) => {
        setError(cause.message);
        setReady(true);
      });
  }, []);

  const selected = books.find((book) => book.id === bookId);
  const catalog = bookId ? getBookById(bookId) : undefined;
  const hits = useMemo(() => searchCommentaryBooks(books, query), [books, query]);
  const ot = hits.filter((book) => getBookById(book.id)?.testament === "OT");
  const nt = hits.filter((book) => getBookById(book.id)?.testament === "NT");

  if (bookId) {
    const previous = adjacentCommentaryBook(books, bookId, -1);
    const next = adjacentCommentaryBook(books, bookId, 1);
    return (
      <Page
        title={catalog ? commentaryBookLabel(bookId, "en") : "Brief Commentary"}
        subtitle={catalog?.nameTamil ?? "வேதாகமம் சுருக்கவுரை"}
        back
      >
        <p className="text-sm text-muted">
          Scanned Tamil brief commentary. A study aid, not Scripture. Pages load once, then stay on this phone.
        </p>
        {!ready ? <p className="mt-4 text-sm text-muted">Loading commentary…</p> : null}
        {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
        {ready && !selected ? (
          <p className="mt-4 text-sm text-muted">This book is not in the brief commentary.</p>
        ) : null}
        {selected ? (
          <div className="mt-4 grid gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{selected.pages.length} pages</p>
            {selected.pages.map((file, index) => (
              <CommentaryScan key={file} file={file} page={index + 1} bookName={catalog?.nameTamil ?? bookId} />
            ))}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold disabled:opacity-40 dark:bg-white/5"
                disabled={!previous}
                onClick={() => previous && navigate(`/commentary/${previous.id}`)}
              >
                ← {previous ? commentaryBookLabel(previous.id, "en") : "Start"}
              </button>
              <button
                type="button"
                className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold disabled:opacity-40 dark:bg-white/5"
                disabled={!next}
                onClick={() => next && navigate(`/commentary/${next.id}`)}
              >
                {next ? commentaryBookLabel(next.id, "en") : "End"} →
              </button>
            </div>
          </div>
        ) : null}
      </Page>
    );
  }

  return (
    <Page title="Brief Commentary" subtitle="வேதாகமம் சுருக்கவுரை" back>
      <SearchBar value={query} onChange={setQuery} placeholder="Genesis • யோவான் • Psalms" />
      <p className="mt-4 text-sm text-muted">
        Good News Tamil brief commentary by book. This is a study aid, not Scripture, and is not a BSI publication.
      </p>
      <div className="mt-5 grid gap-3">
        {!ready ? <p className="text-sm text-muted">Loading commentary…</p> : null}
        {error ? <p className="text-sm text-muted">{error}</p> : null}
        {ready && !error && hits.length === 0 ? (
          <p className="text-sm text-muted">No commentary books matched on this phone.</p>
        ) : null}
        {ot.length ? <BookGroup title="Old Testament" books={ot} onOpen={(id) => navigate(`/commentary/${id}`)} /> : null}
        {nt.length ? <BookGroup title="New Testament" books={nt} onOpen={(id) => navigate(`/commentary/${id}`)} /> : null}
      </div>
    </Page>
  );
}

function BookGroup({
  title,
  books,
  onOpen,
}: {
  title: string;
  books: CommentaryBook[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className="grid gap-2">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">{title}</p>
      {books.map((book) => {
        const catalog = BOOK_CATALOG.find((item) => item.id === book.id);
        return (
          <Card key={book.id} onClick={() => onOpen(book.id)}>
            <p className="font-semibold">{catalog?.nameEnglish ?? book.id}</p>
            <p className="tamil mt-1 text-sm text-muted">{catalog?.nameTamil}</p>
            <p className="mt-1 text-xs text-muted">
              {book.pages.length} {book.pages.length === 1 ? "page" : "pages"}
            </p>
          </Card>
        );
      })}
    </section>
  );
}

function CommentaryScan({ file, page, bookName }: { file: string; page: number; bookName: string }) {
  const [src, setSrc] = useState(commentaryPageUrl(file));
  return (
    <figure className="overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5">
      <img
        src={src}
        alt={`${bookName} commentary page ${page}`}
        loading={page === 1 ? "eager" : "lazy"}
        className="w-full bg-paper-2"
        onError={() => {
          const fallback = commentaryPageFallbackUrl(file);
          if (src !== fallback) setSrc(fallback);
        }}
      />
    </figure>
  );
}
