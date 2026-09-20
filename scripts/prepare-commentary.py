#!/usr/bin/env python3
"""Build the Good News brief-commentary catalog from the public-domain page scans."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "bible-data" / "commentary"
OUT_FILE = OUT_DIR / "commentary.json"
TMP = ROOT / "tmp-commentary"
SOURCE_REPO = "https://github.com/yesudas/good-news-brief-commentary.git"
SOURCE_HTML = TMP / "வேதாகமம்-சுருக்கவுரை" / "html"

SKIP_FILES = {"bible", "chart", "main-head"}
SKIP_IMAGES = {
    "gnp-home.gif",
    "alpha.gif",
    "arrow-left.png",
    "arrow-right.png",
    "test.gif",
    "test1.gif",
    "address.gif",
}

FILE_TO_BOOK = {
    "1chronicles": "1-chronicles",
    "1corinthians": "1-corinthians",
    "1john": "1-john",
    "1kings": "1-kings",
    "1peter": "1-peter",
    "1samuel": "1-samuel",
    "1thessalonians": "1-thessalonians",
    "1timothy": "1-timothy",
    "2chronicles": "2-chronicles",
    "2corinthians": "2-corinthians",
    "2john": "2-john",
    "2kings": "2-kings",
    "2peter": "2-peter",
    "2samuel": "2-samuel",
    "2thessalonians": "2-thessalonians",
    "2timothy": "2-timothy",
    "3john": "3-john",
    "songofsolomon": "song-of-solomon",
    "theacts": "acts",
}

IMG_RE = re.compile(r'src="\.\./assets/([^"]+)"')


def book_id_for_file(stem: str) -> str:
    return FILE_TO_BOOK.get(stem, stem)


def is_page_image(name: str) -> bool:
    lower = name.lower()
    if lower in SKIP_IMAGES:
        return False
    return lower.endswith((".jpg", ".jpeg", ".png", ".gif"))


def ensure_source() -> None:
    if SOURCE_HTML.exists():
        return
    TMP.mkdir(parents=True, exist_ok=True)
    subprocess.check_call(["git", "clone", "--depth", "1", SOURCE_REPO, str(TMP)])


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


def convert() -> dict:
    books = []
    for path in sorted(SOURCE_HTML.glob("*.php")):
        stem = path.stem
        if stem in SKIP_FILES:
            continue
        pages = extract_pages(path)
        if not pages:
            raise SystemExit(f"No commentary pages found in {path.name}")
        books.append({"id": book_id_for_file(stem), "pages": pages})
    books.sort(key=lambda item: item["id"])
    return {
        "source": "https://github.com/yesudas/good-news-brief-commentary",
        "license": "Public domain per Matthew 10:8. MIT covers the repository packaging.",
        "title": "வேதாகமம் சுருக்கவுரை",
        "titleEnglish": "Good News Brief Commentary",
        "count": sum(len(book["pages"]) for book in books),
        "books": books,
    }


def main() -> None:
    ensure_source()
    payload = convert()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUT_FILE} ({payload['count']} pages, {len(payload['books'])} books)")


if __name__ == "__main__":
    main()
