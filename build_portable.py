"""
Bundle the rendered personal site into one self-contained HTML file that can
be emailed, dragged into Slack, or opened via file:// with zero server and
zero local file dependencies.

Fetches the already-Jinja2-rendered page from the running dev server (so all
templating is resolved), then inlines every /static/... image and resume PDF
as a base64 data URI. Google Fonts + Tailwind CDN remain as external <link>/
<script> tags (same tradeoff used for the Call Complexity portable demo) --
those still need internet, everything else does not.

Run (with `uvicorn main:app --port 8420` already running):
    python3 build_portable.py
Writes: victor-chowdhury-portfolio-portable.html
"""
import base64
import mimetypes
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
SITE_URL = "http://127.0.0.1:8420/"
OUT_PATH = ROOT / "victor-chowdhury-portfolio-portable.html"


def fetch_rendered_html() -> str:
    with urllib.request.urlopen(SITE_URL, timeout=10) as resp:
        return resp.read().decode("utf-8")


def inline_static_assets(html: str) -> str:
    pattern = re.compile(r'(src|href)="(/static/[^"]+)"')

    def replace(match: re.Match) -> str:
        attr, url_path = match.group(1), match.group(2)
        local_path = ROOT / url_path.lstrip("/")
        if not local_path.exists():
            print(f"WARNING: {local_path} not found, leaving reference as-is")
            return match.group(0)
        mime, _ = mimetypes.guess_type(str(local_path))
        mime = mime or "application/octet-stream"
        data = base64.b64encode(local_path.read_bytes()).decode("ascii")
        return f'{attr}="data:{mime};base64,{data}"'

    return pattern.sub(replace, html)


if __name__ == "__main__":
    html = fetch_rendered_html()
    before_refs = len(re.findall(r'/static/', html))
    html = inline_static_assets(html)
    after_refs = len(re.findall(r'/static/', html))
    OUT_PATH.write_text(html)
    print(f"Inlined {before_refs - after_refs} of {before_refs} /static/ references")
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size / 1_000_000:.2f} MB)")
