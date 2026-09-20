#!/usr/bin/env python3
"""Convert the public Tamil Strong's MyBible module into bundled JSON."""

from __future__ import annotations

import html
import json
import re
import sqlite3
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "bible-data" / "strongs"
OUT_FILE = OUT_DIR / "strongs.json"
TMP = ROOT / "tmp-strongs"
SOURCE_ZIP = (
    "https://raw.githubusercontent.com/yesudas/strongs-dictionary-in-tamil/main/"
    "%E0%AE%B8%E0%AF%8D%E0%AE%9F%E0%AF%8D%E0%AE%B0%E0%AE%BE%E0%AE%99%E0%AF%8D%E0%AE%95%E0%AF%8D%E0%AE%B8%E0%AF%8D-"
    "%E0%AE%8E%E0%AE%AA%E0%AE%BF%E0%AE%B0%E0%AF%87%E0%AE%AF%E0%AE%AE%E0%AF%81%E0%AE%AE%E0%AF%8D-"
    "%E0%AE%95%E0%AE%BF%E0%AE%B0%E0%AF%87%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%AE%E0%AF%81%E0%AE%AE%E0%AF%8D-"
    "%E0%AE%9A%E0%AF%87%E0%AE%B0%E0%AF%8D%E0%AE%A8%E0%AF%8D%E0%AE%A4-%E0%AE%85%E0%AE%95%E0%AE%B0%E0%AE%BE%E0%AE%A4%E0%AE%BF/"
    "module-for-MyBible-mobile-app/TStrongs.dictionary.zip"
)

POS_RE = re.compile(r"Part\(s\) of speech:\s*</strong>(.*?)(?:<p\s*/>|$)", re.I | re.S)
ENGLISH_RE = re.compile(
    r"Original in English:\s*</strong>(.*?)(?:<strong>தொடர்பு|<strong>Cognate|$)",
    re.I | re.S,
)
TAMIL_RE = re.compile(
    r"Part\(s\) of speech:\s*</strong>.*?(?:<p\s*/>)+(?P<body>.*?)(?:<strong>ஆங்கில மூலம்|<strong>Original in English|$)",
    re.I | re.S,
)
STRONG_LINK_RE = re.compile(r"<a href='S:([HG]\d+)'>[^<]*</a>", re.I)
BIBLE_LINK_RE = re.compile(r"<a href='B:\d+\s+[^']+'>(.*?)</a>", re.S)
TAG_RE = re.compile(r"<[^>]+>")


def html_to_text(value: str) -> str:
    text = value.replace("<p/>", "\n").replace("<p />", "\n").replace("<br/>", "\n").replace("<br />", "\n")
    text = STRONG_LINK_RE.sub(r"\1", text)
    text = BIBLE_LINK_RE.sub(r"\1", text)
    text = re.sub(r"</?(he|i|b|em|strong)>", "", text, flags=re.I)
    text = TAG_RE.sub("", text)
    text = html.unescape(text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def first_match(pattern: re.Pattern[str], value: str) -> str:
    match = pattern.search(value or "")
    return html_to_text(match.group(1) if match.lastindex else match.group("body")) if match else ""


def convert(db_path: Path) -> dict:
    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        "SELECT topic, lexeme, transliteration, pronunciation, short_definition, definition FROM dictionary"
    ).fetchall()
    conn.close()

    entries = []
    for topic, lexeme, transliteration, pronunciation, short_definition, definition in rows:
        topic = (topic or "").strip().upper()
        if not re.fullmatch(r"[HG]\d+", topic):
            continue
        raw = definition or ""
        cognates = []
        seen = {topic}
        for number in STRONG_LINK_RE.findall(raw):
            number = number.upper()
            if number not in seen:
                seen.add(number)
                cognates.append(number)
        entries.append(
            {
                "id": topic,
                "language": "hebrew" if topic.startswith("H") else "greek",
                "lexeme": (lexeme or "").strip(),
                "transliteration": (transliteration or "").strip(),
                "pronunciation": (pronunciation or "").strip(),
                "shortDefinition": (short_definition or "").strip(),
                "partOfSpeech": first_match(POS_RE, raw),
                "tamil": first_match(TAMIL_RE, raw),
                "english": first_match(ENGLISH_RE, raw),
                "cognates": cognates,
            }
        )

    entries.sort(key=lambda item: (0 if item["language"] == "hebrew" else 1, int(item["id"][1:])))
    return {
        "source": "https://github.com/yesudas/strongs-dictionary-in-tamil",
        "license": "Public-domain Tamil Strong's wording, packaged from the MyBible TStrongs module. MIT covers the repository packaging.",
        "count": len(entries),
        "entries": entries,
    }


def ensure_sqlite() -> Path:
    TMP.mkdir(parents=True, exist_ok=True)
    db_path = TMP / "TStrongs.dictionary.SQLite3"
    if db_path.exists() and db_path.stat().st_size > 0:
        return db_path
    zip_path = TMP / "TStrongs.dictionary.zip"
    if not zip_path.exists():
        print("Downloading Tamil Strong's MyBible module…")
        urllib.request.urlretrieve(SOURCE_ZIP, zip_path)
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(TMP)
    if not db_path.exists():
        raise SystemExit("MyBible Strong's SQLite file was not found in the zip.")
    return db_path


def main() -> None:
    payload = convert(ensure_sqlite())
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {payload['count']} entries to {OUT_FILE} ({OUT_FILE.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
