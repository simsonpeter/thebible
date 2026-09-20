#!/usr/bin/env python3
"""Build the Good News full Tamil commentary catalog (வேதாகமம் விரிவுரை).

Clones only the HTML chapter index pages (sparse) and records the scan filenames
referenced in each chapter. Page images stay on the upstream CDN at runtime.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "bible-data" / "commentary"
OUT_FILE = OUT_DIR / "full-commentary.json"
TMP = ROOT / "tmp-full-commentary"
SOURCE_REPO = "https://github.com/yesudas/good-news-tamil-bible-commentary.git"
ROOT_FOLDER = "வேதாகமம்-விரிவுரை"

SECTIONS = [
    "1-பஞ்சாகமம்-விரிவுரை",
    "2-சரித்திர-ஆகமங்கள்-விரிவுரை",
    "3-கவிதை-ஆகமங்கள்-விரிவுரை",
    "4-தீர்க்கதரிசன-ஆகமங்கள்-விரிவுரை",
    "5-சுவிசேஷ-ஆகமங்கள்-விரிவுரை",
    "6-அப்போஸ்தலர்-நிருபங்கள்-வெளிப்படுத்தல்-விரிவுரை",
]

SKIP_STEMS = {"bible", "chart1", "porul"}
SKIP_STEM_PREFIXES = ("head", "heading")

SKIP_IMAGES = {
    "gnp-home.gif",
    "alpha.gif",
    "alpha1.gif",
    "arrow-left.png",
    "arrow-right.png",
    "test.gif",
    "test1.gif",
    "address.gif",
}

PREFIX_TO_BOOK = {
    "gen": "genesis",
    "exo": "exodus",
    "levi": "leviticus",
    "num": "numbers",
    "deu": "deuteronomy",
    "jos": "joshua",
    "jud": "judges",
    "ruth": "ruth",
    "1 sam": "1-samuel",
    "2 sam": "2-samuel",
    "1 kings": "1-kings",
    "2 kings": "2-kings",
    "1 chro": "1-chronicles",
    "2 chro": "2-chronicles",
    "ezra": "ezra",
    "nehe": "nehemiah",
    "esther": "esther",
    "job": "job",
    "psalms": "psalms",
    "pro": "proverbs",
    "ecc": "ecclesiastes",
    "song": "song-of-solomon",
    "isa": "isaiah",
    "jer": "jeremiah",
    "lam": "lamentations",
    "eze": "ezekiel",
    "dan": "daniel",
    "hos": "hosea",
    "joel": "joel",
    "amos": "amos",
    "obadiah": "obadiah",
    "jonah": "jonah",
    "micah": "micah",
    "nah": "nahum",
    "hab": "habakkuk",
    "zep": "zephaniah",
    "haggai": "haggai",
    "zechariah": "zechariah",
    "mal": "malachi",
    "mat": "matthew",
    "mar": "mark",
    "luk": "luke",
    "joh": "john",
    "act": "acts",
    "rom": "romans",
    "1cor": "1-corinthians",
    "2cor": "2-corinthians",
    "gal": "galatians",
    "eph": "ephesians",
    "phi": "philippians",
    "col": "colossians",
    "1thess": "1-thessalonians",
    "2thess": "2-thessalonians",
    "1timo": "1-timothy",
    "2timo": "2-timothy",
    "titu": "titus",
    "phile": "philemon",
    "heb": "hebrews",
    "james": "james",
    "1pet": "1-peter",
    "2pet": "2-peter",
    "1joh": "1-john",
    "2joh": "2-john",
    "3joh": "3-john",
    "jude": "jude",
    "rev": "revelation",
}

IMG_RE = re.compile(r'src="\.\./assets/([^"]+)"', re.IGNORECASE)
SPACED = re.compile(r"^(.+?)\s+(\d+|int)$", re.IGNORECASE)
GLUED = re.compile(r"^([a-z]+)(\d+|int)$", re.IGNORECASE)


def ensure_source() -> Path:
    probe = TMP / ROOT_FOLDER / SECTIONS[0] / "html"
    if probe.exists() and any(probe.glob("*.php")):
        return TMP
    if TMP.exists():
        shutil.rmtree(TMP)
    subprocess.check_call(
        [
            "git",
            "clone",
            "--depth",
            "1",
            "--filter=blob:none",
            "--sparse",
            SOURCE_REPO,
            str(TMP),
        ]
    )
    paths = [f"{ROOT_FOLDER}/{section}/html" for section in SECTIONS]
    subprocess.check_call(["git", "-C", str(TMP), "sparse-checkout", "set", *paths])
    return TMP


def is_page_image(name: str) -> bool:
    lower = name.lower()
    if lower in SKIP_IMAGES:
        return False
    return lower.endswith((".jpg", ".jpeg", ".png", ".gif"))


def should_skip_stem(stem: str) -> bool:
    lower = stem.strip().lower()
    if lower in SKIP_STEMS:
        return True
    return any(lower.startswith(prefix) for prefix in SKIP_STEM_PREFIXES)


def parse_stem(stem: str) -> tuple[str, str] | None:
    text = stem.strip()
    spaced = SPACED.match(text)
    if spaced:
        return spaced.group(1).strip().lower(), spaced.group(2).lower()
    glued = GLUED.match(text)
    if glued:
        return glued.group(1).lower(), glued.group(2).lower()
    return None


def extract_pages(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    pages: list[str] = []
    seen: set[str] = set()
    for name in IMG_RE.findall(text):
        if not is_page_image(name) or name in seen:
            continue
        seen.add(name)
        pages.append(name)
    return pages


def chapter_sort_key(chapter_id: str) -> tuple[int, int]:
    if chapter_id == "int":
        return (0, 0)
    return (1, int(chapter_id))


def convert(source_root: Path) -> dict:
    books: dict[str, dict] = {}

    for section in SECTIONS:
        html_dir = source_root / ROOT_FOLDER / section / "html"
        if not html_dir.exists():
            raise SystemExit(f"Missing section HTML folder: {html_dir}")
        for path in sorted(html_dir.glob("*.php")):
            stem = path.stem
            if should_skip_stem(stem):
                continue
            parsed = parse_stem(stem)
            if not parsed:
                raise SystemExit(f"Unrecognized commentary chapter file: {path.name}")
            prefix, chapter_id = parsed
            book_id = PREFIX_TO_BOOK.get(prefix)
            if not book_id:
                raise SystemExit(f"Unknown book prefix {prefix!r} in {path.name}")
            pages = extract_pages(path)
            if not pages:
                raise SystemExit(f"No commentary pages found in {path}")
            entry = books.setdefault(book_id, {"id": book_id, "section": section, "chapters": {}})
            if entry["section"] != section:
                raise SystemExit(f"Book {book_id} appears in both {entry['section']} and {section}")
            chapters: dict = entry["chapters"]
            if chapter_id in chapters:
                raise SystemExit(f"Duplicate chapter {book_id} {chapter_id}")
            chapters[chapter_id] = pages

    payload_books = []
    for book_id, entry in books.items():
        chapters = [
            {"id": chapter_id, "pages": pages}
            for chapter_id, pages in sorted(entry["chapters"].items(), key=lambda item: chapter_sort_key(item[0]))
        ]
        payload_books.append({"id": book_id, "section": entry["section"], "chapters": chapters})
    payload_books.sort(key=lambda item: item["id"])

    page_count = sum(len(chapter["pages"]) for book in payload_books for chapter in book["chapters"])
    return {
        "source": "https://github.com/yesudas/good-news-tamil-bible-commentary",
        "license": "Public domain per Matthew 10:8. MIT covers the repository packaging.",
        "title": "வேதாகமம் விரிவுரை",
        "titleEnglish": "Good News Tamil Bible Commentary",
        "rootFolder": ROOT_FOLDER,
        "count": page_count,
        "books": payload_books,
    }


def main() -> None:
    source = ensure_source()
    payload = convert(source)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUT_FILE} ({payload['count']} pages, {len(payload['books'])} books)")


if __name__ == "__main__":
    main()
