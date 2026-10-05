#!/usr/bin/env python3
"""
Build an enriched Montessori lesson catalog for the Panacea frontend.

Sources (scraped Illumine data, read-only):
  illumine/web_clonner/illumine_data/data/lessons_catalog.json   -> full catalog (3190 lessons)
  illumine/web_clonner/illumine_data/data/lesson_*.json          -> per-lesson detail (936, richer descriptions + media)

Output (written):
  src/lib/mock/lessonCatalog.ts  -> enriched LESSON_CATALOG + LESSON_CATEGORIES
  src/lib/mock/lessonCatalog.json -> same data as JSON (for tooling)

Merge rules:
  - Base = full catalog (all 3190 lessons).
  - Where a per-lesson detail file exists (matched by id), overlay its
    full description and media thumbnail.
  - ids are the stable Illumine firebase ids; ageBand is normalized to a
    friendly category string.
"""

import json
import os
import re
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.environ.get(
    "ILLUMINE_DATA_DIR",
    os.path.join(REPO_ROOT, "..", "illumine", "web_clonner", "illumine_data", "data"),
)
OUT_TS = os.path.join(REPO_ROOT, "src", "lib", "mock", "lessonCatalog.ts")
OUT_JSON = os.path.join(REPO_ROOT, "src", "lib", "mock", "lessonCatalog.json")

# Age-band short code -> friendly Panacea category label.
BAND_LABELS = {
    "1.5-3": "Toddler (1.5-3)",
    "3-6": "Primary (3-6)",
    "6-9": "Elementary (6-9)",
    "9-12": "Elementary (9-12)",
    "6-12": "Elementary (6-12)",
}


def band_label(band: str) -> str:
    return BAND_LABELS.get(band, band)


def category_label(band_codes) -> str:
    """Collapse a lesson's age bands/categories into one friendly label."""
    if not band_codes:
        return "All Categories"
    labels = [band_label(b) for b in band_codes]
    return " / ".join(labels)


def clean_desc(desc) -> str:
    if not desc:
        return ""
    # Normalize bullets and trim whitespace per line; keep paragraph breaks.
    lines = [ln.strip() for ln in desc.replace("\r\n", "\n").split("\n")]
    # Drop empty leading/trailing lines
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines)


def js_str(s) -> str:
    """Escape a string for inclusion in a TS single-quoted string literal."""
    s = s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")
    return s


def main() -> int:
    catalog_path = os.path.join(DATA_DIR, "lessons_catalog.json")
    if not os.path.exists(catalog_path):
        print(f"[build_lesson_catalog] missing catalog: {catalog_path}", file=sys.stderr)
        return 1

    with open(catalog_path, encoding="utf-8") as f:
        catalog = json.load(f)

    # Index per-lesson detail files by id.
    details: dict[str, dict] = {}
    if os.path.isdir(DATA_DIR):
        for fn in sorted(os.listdir(DATA_DIR)):
            if not fn.startswith("lesson_") or not fn.endswith(".json"):
                continue
            path = os.path.join(DATA_DIR, fn)
            try:
                with open(path, encoding="utf-8") as f:
                    payload = json.load(f)
            except Exception:
                continue
            # Some files are a bare array; some wrap in {"response": {...}}.
            if isinstance(payload, list):
                resp = payload[0] if payload else {}
            else:
                resp = payload.get("response") or payload
            lid = resp.get("id")
            if not lid:
                continue
            details[lid] = {
                "description": clean_desc(resp.get("description")),
                "media": [
                    m.get("thumbnail") or m.get("path")
                    for m in (resp.get("mediaProfiles") or [])
                    if m and (m.get("thumbnail") or m.get("path"))
                ],
            }

    rows = []
    for item in catalog:
        lid = item.get("id")
        name = (item.get("name") or "").strip()
        if not lid or not name:
            continue

        band_codes = list(item.get("ageBand") or [])
        cats = [c.get("name") for c in (item.get("category") or []) if c]
        # Prefer explicit category names; fall back to age band labels.
        if cats:
            labels = []
            for c in cats:
                if c not in labels:
                    labels.append(c)
            category = " / ".join(labels)
        else:
            category = category_label(band_codes)

        dev_areas = []
        for a in item.get("developmentAreasList") or []:
            t = (a.get("title") or "").strip()
            if t and t not in dev_areas:
                dev_areas.append(t)
        sub_areas = []
        for a in item.get("subDevelopmentAreasList") or []:
            t = (a.get("title") or "").strip()
            if t and t not in sub_areas:
                sub_areas.append(t)

        desc = clean_desc(item.get("description"))
        thumb = ""
        detail = details.get(lid)
        if detail:
            if detail["description"]:
                desc = detail["description"]
            if detail["media"]:
                thumb = detail["media"][0]

        rows.append(
            {
                "id": lid,
                "title": name,
                "ageBand": category,
                "developmentAreas": dev_areas,
                "subDevelopmentAreas": sub_areas,
                "description": desc,
                "mediaThumbUrl": thumb,
            }
        )

    # Preserve a stable order: Toddler, Primary, Elementary (6-9), (6-12), (9-12).
    order = {
        "Toddler (1.5-3)": 0,
        "Primary (3-6)": 1,
        "Elementary (6-9)": 2,
        "Elementary (6-12)": 3,
        "Elementary (9-12)": 4,
    }

    def sort_key(r):
        return (order.get(r["ageBand"], 99), r["title"].lower())

    rows.sort(key=sort_key)

    # Distinct categories in display order (label -> first bucket).
    cats = [
        "All Categories",
        "Toddler (1.5-3)",
        "Primary (3-6)",
        "Elementary (6-9)",
        "Elementary (6-12)",
        "Elementary (9-12)",
    ]
    present = set(r["ageBand"] for r in rows)
    categories = [c for c in cats if c in present or c == "All Categories"]

    # Write JSON mirror (for tooling).
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump({"categories": categories, "lessons": rows}, f, ensure_ascii=False, indent=1)

    # Write TS module.
    lines = [
        "/**",
        " * Enriched Montessori lesson catalog — generated by scripts/build_lesson_catalog.py.",
        " * Do not hand-edit; regenerate with:  python3 scripts/build_lesson_catalog.py",
        " *",
        f" * Source: {len(rows)} lessons from the scraped Illumine curriculum data",
        f" * ({sum(1 for r in rows if r['description']) } with descriptions,",
        f" *  {sum(1 for r in rows if r['mediaThumbUrl'])} with media thumbnails).",
        " */",
        "",
        "export type CatalogLesson = {",
        "  id: string;",
        "  title: string;",
        "  ageBand: string;",
        "  developmentAreas: string[];",
        "  subDevelopmentAreas: string[];",
        "  description: string;",
        "  mediaThumbUrl: string;",
        "};",
        "",
        "export const LESSON_CATEGORIES = [",
    ]
    for c in categories:
        lines.append(f'  "{c}",')
    lines.append("] as const;")
    lines.append("")
    lines.append("export const LESSON_CATALOG: CatalogLesson[] = [")
    for r in rows:
        lines.append("  {")
        lines.append(f"    id: '{js_str(r['id'])}',")
        lines.append(f"    title: '{js_str(r['title'])}',")
        lines.append(f"    ageBand: '{js_str(r['ageBand'])}',")
        lines.append(
            "    developmentAreas: ["
            + ", ".join(f"'{js_str(a)}'" for a in r["developmentAreas"])
            + "],"
        )
        lines.append(
            "    subDevelopmentAreas: ["
            + ", ".join(f"'{js_str(a)}'" for a in r["subDevelopmentAreas"])
            + "],"
        )
        lines.append(f"    description: '{js_str(r['description'])}',")
        lines.append(f"    mediaThumbUrl: '{js_str(r['mediaThumbUrl'])}',")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"[build_lesson_catalog] wrote {len(rows)} lessons -> {OUT_TS}")
    print(f"[build_lesson_catalog] wrote JSON mirror -> {OUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
