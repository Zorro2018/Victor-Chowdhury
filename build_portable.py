"""
Bundle the rendered personal site into one self-contained HTML file that can
be emailed, dragged into Slack, or opened via file:// with zero server and
zero local file dependencies.

Fetches the already-Jinja2-rendered page from the running dev server (so all
templating is resolved), then inlines every /static/... IMAGE as a base64
data URI. PDFs (resumes) are deliberately left as plain relative links
instead of being inlined -- three resumes' worth of base64 PDF text used to
balloon this file into the 10+ MB range, which is a slow, janky first
open on mobile. Since index.html is committed to the repo root alongside
the actual PDF files (and served that way from GitHub Pages), a bare
relative filename resolves correctly there, and also works if someone
downloads the whole repo and opens index.html locally -- the PDFs just
need to stay sitting next to it.

Google Fonts + Tailwind CDN remain as external <link>/<script> tags (same
tradeoff used for the Call Complexity portable demo) -- those still need
internet, everything else (aside from the linked PDFs) does not.

Run (with `uvicorn main:app --port 8420` already running):
    python3 build_portable.py
Writes: index.html
"""
import base64
import mimetypes
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
SITE_URL = "http://127.0.0.1:8420/"
OUT_PATH = ROOT / "index.html"

# Extensions that get base64-inlined. PDFs are excluded on purpose -- see
# the module docstring -- and instead rewritten to a bare relative link.
INLINE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".ico"}


def fetch_rendered_html() -> str:
    with urllib.request.urlopen(SITE_URL, timeout=10) as resp:
        return resp.read().decode("utf-8")


def inline_static_assets(html: str) -> str:
    # /static/ is a URL prefix only -- main.py mounts it over the flat
    # project root, so the on-disk file is just the bare filename here.
    pattern = re.compile(r'(src|href)="/static/([^"]+)"')

    def replace(match: re.Match) -> str:
        attr, filename = match.group(1), match.group(2)
        local_path = ROOT / filename
        if not local_path.exists():
            print(f"WARNING: {local_path} not found, leaving reference as-is")
            return match.group(0)

        if local_path.suffix.lower() in {".pdf", ".vcf"}:
            # Leave as a plain relative link -- see module docstring. vCards
            # are also better as a real downloadable file than a data URI,
            # since some contact-app "import" flows expect an actual file.
            return f'{attr}="{filename}"'

        if local_path.suffix.lower() not in INLINE_EXTENSIONS:
            return match.group(0)

        mime, _ = mimetypes.guess_type(str(local_path))
        mime = mime or "application/octet-stream"
        data = base64.b64encode(local_path.read_bytes()).decode("ascii")
        return f'{attr}="data:{mime};base64,{data}"'

    return pattern.sub(replace, html)


if __name__ == "__main__":
    template_path = ROOT / "template.html"
    assert OUT_PATH.resolve() != template_path.resolve(), (
        "OUT_PATH must never be template.html -- refusing to run."
    )

    html = fetch_rendered_html()
    before_refs = len(re.findall(r'/static/', html))
    html = inline_static_assets(html)
    after_refs = len(re.findall(r'/static/', html))
    OUT_PATH.write_text(html)
    print(f"Resolved {before_refs - after_refs} of {before_refs} /static/ references "
          f"(images inlined as base64, PDFs relinked as relative files)")
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size / 1_000_000:.2f} MB)")

    # Tripwire: this project's template.html got mysteriously clobbered with
    # fully-rendered content more than once during development. Whatever the
    # cause, fail loudly right here rather than silently shipping a broken
    # template on the next request.
    still_a_template = "{{ profile" in template_path.read_text()
    assert still_a_template, (
        f"DANGER: {template_path} no longer looks like a Jinja2 template "
        "(no '{{ profile' found) after running this script. Restore it "
        "immediately with: git checkout HEAD -- template.html"
    )
    print(f"OK: {template_path} is still a clean template.")
