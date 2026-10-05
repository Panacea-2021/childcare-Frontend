import json
import pathlib
import re

p = pathlib.Path(
    r"C:\Users\pavan\.cursor\projects\c-Users-pavan-OneDrive-Desktop-ChildCare\agent-transcripts\00b70f80-3e67-49af-bd56-0a6cfb63529d\00b70f80-3e67-49af-bd56-0a6cfb63529d.jsonl"
)


def walk(o):
    if isinstance(o, str) and "Releasing into the toilet" in o and o.count("Toddler") > 20:
        return o
    if isinstance(o, dict):
        for v in o.values():
            r = walk(v)
            if r:
                return r
    if isinstance(o, list):
        for v in o:
            r = walk(v)
            if r:
                return r
    return None


text = None
for line in p.open(encoding="utf-8", errors="replace"):
    try:
        obj = json.loads(line)
    except Exception:
        continue
    s = json.dumps(obj)
    if "Wiping" in s and "Toddler (1.5-3)" in s and "Releasing into the toilet" in s and len(s) > 50000:
        text = walk(obj)
        if text:
            print("found len", len(text))
            break

if not text:
    raise SystemExit("not found")

# Prefer newline-pair section starting at first "Wiping\nToddler"
m = re.search(r"(^|\n)Wiping\nToddler \(1\.5-3\)", text)
if m:
    chunk = text[m.start() :]
    # cut off at implement instruction or space-joined duplicate
    cut = re.search(r"\nimplement the properly|\nWiping Toddler \(1\.5-3\)\s+Releasing", chunk)
    if cut:
        chunk = chunk[: cut.start()]
    text = chunk

bands = [
    "Toddler (1.5-3)",
    "Primary (3-6)",
    "Elementary (6-12)",
    "Elementary (9-12)",
    "Elementary (6-9)",
]
band_re = "|".join(re.escape(b) for b in bands)

lessons = []
# Format A: Title\nBand[, Band]
lines = [ln.strip() for ln in text.splitlines()]
i = 0
while i < len(lines):
    title = lines[i]
    if not title or title.startswith("implement"):
        i += 1
        continue
    if i + 1 < len(lines) and re.fullmatch(rf"({band_re})(, ({band_re}))*", lines[i + 1]):
        bands_found = [b.strip() for b in lines[i + 1].split(",")]
        for b in bands_found:
            lessons.append({"title": title, "ageBand": b})
        i += 2
        continue
    i += 1

# Fallback / supplement: space-joined "Title Band"
if len(lessons) < 500:
    flat = re.findall(rf"(.+?)\s+({band_re})(?:,\s*({band_re}))?", text)
    lessons = []
    for title, b1, b2 in flat:
        title = title.strip(" \t-·.")
        if not title or len(title) > 160:
            continue
        lessons.append({"title": title, "ageBand": b1})
        if b2:
            lessons.append({"title": title, "ageBand": b2})

# Dedupe preserving order
seen = set()
unique = []
for item in lessons:
    key = (item["title"], item["ageBand"])
    if key in seen:
        continue
    seen.add(key)
    unique.append(item)

out_dir = pathlib.Path(r"C:\Users\pavan\OneDrive\Desktop\ChildCare\src\lib\mock")
json_path = out_dir / "lessonCatalog.json"
json_path.write_text(json.dumps(unique, ensure_ascii=False, indent=0), encoding="utf-8")

# Also emit TS module for easy import
ts_path = out_dir / "lessonCatalog.ts"
cats = sorted({x["ageBand"] for x in unique})
lines_ts = [
    "export type CatalogLesson = { id: string; title: string; ageBand: string };",
    "",
    "export const LESSON_CATEGORIES = [",
    '  "All Categories",',
]
for c in cats:
    lines_ts.append(f"  {json.dumps(c)},")
lines_ts += [
    "] as const;",
    "",
    "export const LESSON_CATALOG: CatalogLesson[] = [",
]
for idx, item in enumerate(unique):
    slug = re.sub(r"[^a-z0-9]+", "-", item["title"].lower()).strip("-")[:48]
    band_slug = re.sub(r"[^a-z0-9]+", "-", item["ageBand"].lower()).strip("-")
    lid = f"les-{slug}-{band_slug}-{idx}"
    lines_ts.append(
        f"  {{ id: {json.dumps(lid)}, title: {json.dumps(item['title'])}, ageBand: {json.dumps(item['ageBand'])} }},"
    )
lines_ts += ["] as const;", ""]
ts_path.write_text("\n".join(lines_ts), encoding="utf-8")
print("lessons", len(unique), "wrote", ts_path)
print("categories", cats)
