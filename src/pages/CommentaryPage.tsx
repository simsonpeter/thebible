import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { BOOK_CATALOG, getBookById } from "@/data/books";
import {
  COMMENTARY_EDITIONS,
  adjacentCommentaryBook,
  adjacentCommentaryChapter,
  commentaryBookLabel,
  commentaryBookPageCount,
  commentaryChapterLabel,
  commentaryPageFallbackUrl,
  commentaryPageUrl,
  getCommentaryChapter,
  loadCommentaryBooks,
  resolveCommentaryRoute,
  searchCommentaryBooks,
} from "@/services/commentaryService";
import type { CommentaryBook, CommentaryEditionId } from "@/types/commentary";

export function CommentaryPage() {
  const params = useParams<{ edition?: string; book?: string; chapter?: string }>();
  const route = resolveCommentaryRoute(params);

  if (route.legacyBook) {
    return <Navigate to={`/commentary/brief/${route.legacyBook}`} replace />;
  }

  if (!route.edition) {
    return <CommentaryHub />;
  }

  if (route.edition === "full" && route.bookId && route.chapterId) {
    return <FullChapterView bookId={route.bookId} chapterId={route.chapterId} />;
  }

  if (route.edition === "full" && route.bookId) {
    return <FullBookChapters bookId={route.bookId} />;
  }

  if (route.edition === "brief" && route.bookId) {
    return <BriefBookView bookId={route.bookId} />;
  }

  return <EditionBookList edition={route.edition} />;
}

function CommentaryHub() {
  const navigate = useNavigate();
  return (
    <Page title="Commentary" subtitle="வேதாகமம் விரிவுரை" back>
      <p className="text-sm text-muted">
        Good News Tamil commentary scans. Study aids, not Scripture, and not BSI publications.
      </p>
      <div className="mt-5 grid gap-3">
        <Card onClick={() => navigate("/commentary/brief")}>
          <p className="font-semibold">{COMMENTARY_EDITIONS.brief.title}</p>
          <p className="tamil mt-1 text-sm text-muted">{COMMENTARY_EDITIONS.brief.titleTamil}</p>
          <p className="mt-1 text-xs text-muted">Shorter book-by-book overview</p>
        </Card>
        <Card onClick={() => navigate("/commentary/full")}>
          <p className="font-semibold">{COMMENTARY_EDITIONS.full.title}</p>
          <p className="tamil mt-1 text-sm text-muted">{COMMENTARY_EDITIONS.full.titleTamil}</p>
          <p className="mt-1 text-xs text-muted">Exhaustive chapter commentary</p>
        </Card>
      </div>
    </Page>
  );
}

function useCommentaryBooks(edition: CommentaryEditionId) {
  const [books, setBooks] = useState<CommentaryBook[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError("");
    void loadCommentaryBooks(edition)
      .then((loaded) => {
        if (!cancelled) {
          setBooks(loaded);
          setReady(true);
        }
      })
      .catch((cause: Error) => {
        if (!cancelled) {
          setError(cause.message);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [edition]);

  return { books, ready, error };
}

function EditionBookList({ edition }: { edition: CommentaryEditionId }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { books, ready, error } = useCommentaryBooks(edition);
  const meta = COMMENTARY_EDITIONS[edition];
  const hits = useMemo(() => searchCommentaryBooks(books, query), [books, query]);
  const ot = hits.filter((book) => getBookById(book.id)?.testament === "OT");
  const nt = hits.filter((book) => getBookById(book.id)?.testament === "NT");

  return (
    <Page title={meta.title} subtitle={meta.titleTamil} back>
      <SearchBar value={query} onChange={setQuery} placeholder="Genesis • யோவான் • Psalms" />
      <p className="mt-4 text-sm text-muted">
        Good News Tamil {edition === "brief" ? "brief" : "full"} commentary by book. This is a study aid, not
        Scripture, and is not a BSI publication.
      </p>
      <div className="mt-5 grid gap-3">
        {!ready ? <p className="text-sm text-muted">Loading commentary…</p> : null}
        {error ? <p className="text-sm text-muted">{error}</p> : null}
        {ready && !error && hits.length === 0 ? (
          <p className="text-sm text-muted">No commentary books matched on this phone.</p>
        ) : null}
        {ot.length ? (
          <BookGroup
            title="Old Testament"
            books={ot}
            edition={edition}
            onOpen={(id) => navigate(`/commentary/${edition}/${id}`)}
          />
        ) : null}
        {nt.length ? (
          <BookGroup
            title="New Testament"
            books={nt}
            edition={edition}
            onOpen={(id) => navigate(`/commentary/${edition}/${id}`)}
          />
        ) : null}
      </div>
    </Page>
  );
}

function BriefBookView({ bookId }: { bookId: string }) {
  const navigate = useNavigate();
  const { books, ready, error } = useCommentaryBooks("brief");
  const selected = books.find((book) => book.id === bookId);
  const catalog = getBookById(bookId);
  const previous = adjacentCommentaryBook(books, bookId, -1);
  const next = adjacentCommentaryBook(books, bookId, 1);

  return (
    <Page
      title={catalog ? commentaryBookLabel(bookId, "en") : COMMENTARY_EDITIONS.brief.title}
      subtitle={catalog?.nameTamil ?? COMMENTARY_EDITIONS.brief.titleTamil}
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
      {selected?.pages ? (
        <div className="mt-4 grid gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{selected.pages.length} pages</p>
          {selected.pages.map((file, index) => (
            <CommentaryScan
              key={file}
              edition="brief"
              file={file}
              page={index + 1}
              bookName={catalog?.nameTamil ?? bookId}
            />
          ))}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold disabled:opacity-40 dark:bg-white/5"
              disabled={!previous}
              onClick={() => previous && navigate(`/commentary/brief/${previous.id}`)}
            >
              ← {previous ? commentaryBookLabel(previous.id, "en") : "Start"}
            </button>
            <button
              type="button"
              className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold disabled:opacity-40 dark:bg-white/5"
              disabled={!next}
              onClick={() => next && navigate(`/commentary/brief/${next.id}`)}
            >
              {next ? commentaryBookLabel(next.id, "en") : "End"} →
            </button>
          </div>
        </div>
      ) : null}
    </Page>
  );
}

function FullBookChapters({ bookId }: { bookId: string }) {
  const navigate = useNavigate();
  const { books, ready, error } = useCommentaryBooks("full");
  const selected = books.find((book) => book.id === bookId);
  const catalog = getBookById(bookId);

  return (
    <Page
      title={catalog ? commentaryBookLabel(bookId, "en") : COMMENTARY_EDITIONS.full.title}
      subtitle={catalog?.nameTamil ?? COMMENTARY_EDITIONS.full.titleTamil}
      back
    >
      <p className="text-sm text-muted">
        Choose a chapter. Scans load from the public Good News source, then stay cached on this phone.
      </p>
      {!ready ? <p className="mt-4 text-sm text-muted">Loading commentary…</p> : null}
      {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
      {ready && !selected ? (
        <p className="mt-4 text-sm text-muted">This book is not in the full commentary.</p>
      ) : null}
      {selected?.chapters ? (
        <div className="mt-5 grid gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            {selected.chapters.length} chapters · {commentaryBookPageCount(selected)} pages
          </p>
          {selected.chapters.map((chapter) => (
            <Card key={chapter.id} onClick={() => navigate(`/commentary/full/${bookId}/${chapter.id}`)}>
              <p className="font-semibold">{commentaryChapterLabel(chapter.id)}</p>
              <p className="mt-1 text-xs text-muted">
                {chapter.pages.length} {chapter.pages.length === 1 ? "page" : "pages"}
              </p>
            </Card>
          ))}
        </div>
      ) : null}
    </Page>
  );
}

function FullChapterView({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const navigate = useNavigate();
  const { books, ready, error } = useCommentaryBooks("full");
  const selected = books.find((book) => book.id === bookId);
  const chapter = getCommentaryChapter(selected, chapterId);
  const catalog = getBookById(bookId);
  const previous = adjacentCommentaryChapter(selected, chapterId, -1);
  const next = adjacentCommentaryChapter(selected, chapterId, 1);

  return (
    <Page
      title={catalog ? `${commentaryBookLabel(bookId, "en")} ${commentaryChapterLabel(chapterId)}` : "Full Commentary"}
      subtitle={catalog?.nameTamil ?? COMMENTARY_EDITIONS.full.titleTamil}
      back
    >
      <p className="text-sm text-muted">
        Scanned Tamil full commentary. A study aid, not Scripture. Pages load once, then stay on this phone.
      </p>
      {!ready ? <p className="mt-4 text-sm text-muted">Loading commentary…</p> : null}
      {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
      {ready && !chapter ? (
        <p className="mt-4 text-sm text-muted">This chapter is not in the full commentary.</p>
      ) : null}
      {chapter && selected?.section ? (
        <div className="mt-4 grid gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{chapter.pages.length} pages</p>
          {chapter.pages.map((file, index) => (
            <CommentaryScan
              key={file}
              edition="full"
              file={file}
              section={selected.section}
              page={index + 1}
              bookName={catalog?.nameTamil ?? bookId}
            />
          ))}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold disabled:opacity-40 dark:bg-white/5"
              disabled={!previous}
              onClick={() => previous && navigate(`/commentary/full/${bookId}/${previous.id}`)}
            >
              ← {previous ? commentaryChapterLabel(previous.id) : "Start"}
            </button>
            <button
              type="button"
              className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold disabled:opacity-40 dark:bg-white/5"
              disabled={!next}
              onClick={() => next && navigate(`/commentary/full/${bookId}/${next.id}`)}
            >
              {next ? commentaryChapterLabel(next.id) : "End"} →
            </button>
          </div>
        </div>
      ) : null}
    </Page>
  );
}

function BookGroup({
  title,
  books,
  edition,
  onOpen,
}: {
  title: string;
  books: CommentaryBook[];
  edition: CommentaryEditionId;
  onOpen: (id: string) => void;
}) {
  return (
    <section className="grid gap-2">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">{title}</p>
      {books.map((book) => {
        const catalog = BOOK_CATALOG.find((item) => item.id === book.id);
        const pages = commentaryBookPageCount(book);
        const chapterCount = book.chapters?.length;
        return (
          <Card key={book.id} onClick={() => onOpen(book.id)}>
            <p className="font-semibold">{catalog?.nameEnglish ?? book.id}</p>
            <p className="tamil mt-1 text-sm text-muted">{catalog?.nameTamil}</p>
            <p className="mt-1 text-xs text-muted">
              {edition === "full" && chapterCount
                ? `${chapterCount} chapters · ${pages} pages`
                : `${pages} ${pages === 1 ? "page" : "pages"}`}
            </p>
          </Card>
        );
      })}
    </section>
  );
}

function CommentaryScan({
  edition,
  file,
  section,
  page,
  bookName,
}: {
  edition: CommentaryEditionId;
  file: string;
  section?: string;
  page: number;
  bookName: string;
}) {
  const [src, setSrc] = useState(commentaryPageUrl(edition, file, section));
  return (
    <figure className="overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5">
      <img
        src={src}
        alt={`${bookName} commentary page ${page}`}
        loading={page === 1 ? "eager" : "lazy"}
        className="w-full bg-paper-2"
        onError={() => {
          const fallback = commentaryPageFallbackUrl(edition, file, section);
          if (src !== fallback) setSrc(fallback);
        }}
      />
    </figure>
  );
}
