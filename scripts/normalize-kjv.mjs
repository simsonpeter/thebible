import fs from "node:fs";

const inputPath = "public/data/kjv-source.json";
const raw = fs.readFileSync(inputPath);
let text;
if (raw[0] === 0xff && raw[1] === 0xfe) {
  text = raw.subarray(2).toString("utf16le");
} else if (raw[0] === 0xfe && raw[1] === 0xff) {
  text = raw.subarray(2).swap16().toString("utf16le");
} else if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
  text = raw.subarray(3).toString("utf8");
} else {
  text = raw.toString("utf8").replace(/^\uFEFF/, "");
}

const data = JSON.parse(text);
if (!Array.isArray(data) || data.length !== 66) {
  throw new Error(`Expected 66 books, received ${Array.isArray(data) ? data.length : typeof data}`);
}

fs.writeFileSync(inputPath, JSON.stringify(data));
fs.writeFileSync(
  "public/data/_kjv-inspect.json",
  JSON.stringify(
    {
      books: data.length,
      abbrev0: data[0].abbrev,
      genesisChapters: data[0].chapters.length,
      genesis1verses: data[0].chapters[0].length,
      firstVerse: data[0].chapters[0][0].slice(0, 80),
      johnAbbrev: data[42].abbrev,
      johnChapters: data[42].chapters.length,
      revelationChapters: data[65].chapters.length,
      bytes: fs.statSync(inputPath).size,
    },
    null,
    2,
  ),
);
console.log("KJV source normalized");
