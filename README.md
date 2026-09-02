# Victor Chowdhury \u2014 Personal Site

A single-page personal brand site synthesized from three r\u00e9sum\u00e9 variants
(Product, Data & AI, Business Strategy) into one coherent story: an impact
band, four "experience lens" buckets with anecdotes (AI / Product / Business
Strategy / Data), a career timeline, capabilities, and credentials.

## Stack & a deliberate non-choice

FastAPI + Jinja2 + Tailwind (CDN). **No database.** The content here only
changes when Victor updates his r\u00e9sum\u00e9 \u2014 adding SQLite for content that
never mutates at request time would be pure ceremony (YAGNI). All content
lives in `content.py` as plain data; editing the site is a content edit, not
a template hunt.

## Run it

```bash
uv venv
source .venv/bin/activate
uv pip install --index-url https://pypi.ci.artifacts.walmart.com/artifactory/api/pypi/external-pypi/simple \
    --allow-insecure-host pypi.ci.artifacts.walmart.com \
    -r requirements.txt
python3 main.py
```

Open http://127.0.0.1:8420/

## Structure

Everything lives flat in this one folder — no `static/` or `templates/`
subdirectories. `main.py` mounts the project root itself under the `/static`
URL prefix, and `AssetOnlyStaticFiles` (a tiny `StaticFiles` subclass in
`main.py`) only serves known asset extensions (`.png`, `.pdf`, `.css`, `.js`,
etc.) — requesting `/static/main.py` or `/static/content.py` 404s even
though those files physically sit right next to the images.

```
content.py              # single source of truth for all copy/data
main.py                 # FastAPI app, one route, AssetOnlyStaticFiles guard
index.html              # Jinja2 template (Tailwind CDN + vanilla JS tab switch)
*.png, *.pdf            # work-sample/article/certificate thumbnails + résumés
build_portable.py       # bundles the rendered page + all assets into one HTML file
victor-chowdhury-portfolio-portable.html   # the shareable, self-contained build
```

To refresh the portable build after editing content or swapping an asset,
run the dev server (`python3 main.py`) then `python3 build_portable.py`.

## Notes / decisions

- **Phone number omitted from public display.** The source r\u00e9sum\u00e9s include
  a phone number; a public-facing personal site gets scraped relentlessly,
  so only email (mailto) and LinkedIn are surfaced. Easy to add back in
  `content.py` -> `PROFILE["phone"]` + one line in the template if wanted.
- **Business Strategy CV** wasn't explicitly handed over in this task but
  was sitting alongside the other two r\u00e9sum\u00e9s in Downloads and directly
  matched the requested "business strategy" bucket, so its content was
  folded in too. Say the word if that should come back out.
- Anecdotes in each bucket are drawn/paraphrased directly from line items
  across all three r\u00e9sum\u00e9s \u2014 nothing fabricated.
