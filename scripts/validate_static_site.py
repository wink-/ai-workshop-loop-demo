#!/usr/bin/env python3
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.hrefs: list[str] = []
        self.assets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = dict(attrs)
        if "id" in attr and attr["id"]:
            self.ids.add(attr["id"])
        if tag == "a" and attr.get("href"):
            self.hrefs.append(attr["href"] or "")
        if tag == "link" and attr.get("href") and not (attr["href"] or "").startswith("http"):
            self.assets.append(attr["href"] or "")
        if tag == "script" and attr.get("src"):
            self.assets.append(attr["src"] or "")


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)

if not INDEX.exists():
    fail("index.html missing")

text = INDEX.read_text(encoding="utf-8")
parser = LinkParser()
parser.feed(text)

for required in ["main", "loop", "ball-demo", "roles", "evidence", "ship", "ball-canvas", "ball-play-toggle", "ball-reset"]:
    if required not in parser.ids:
        fail(f"missing required id #{required}")

for asset in parser.assets:
    if not (ROOT / asset).exists():
        fail(f"missing local asset: {asset}")

for href in parser.hrefs:
    if href.startswith("#"):
        target = href[1:]
        if target and target not in parser.ids:
            fail(f"broken anchor: {href}")
    elif href.startswith(("http://", "https://", "mailto:")):
        continue
    else:
        clean = href.split("#", 1)[0]
        if clean and not (ROOT / clean).exists():
            fail(f"missing linked file: {href}")

for expected in [
    "artifacts/researcher-discovery.md",
    "artifacts/coder-implementation-note.md",
    "artifacts/github-ops-publication.md",
    "docs/workflow/cockpit-plan.md",
    "docs/workflow/kanban-backed-workflow.md",
    "docs/workflow/markdown-task-vs-kanban-card.md",
    "docs/workflow/loop-supervisor-v3.md",
    "docs/workflow/3d-bouncing-ball-v4.md",
    "docs/workflow/verification.md",
    "scripts/ball_demo.js",
]:
    if not (ROOT / expected).exists():
        fail(f"missing workflow artifact: {expected}")

if re.search(r"TODO|PLACEHOLDER|lorem ipsum", text, re.I):
    fail("placeholder text found")

print("OK: static site links, anchors, assets, and workflow artifacts verified")
