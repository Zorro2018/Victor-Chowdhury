"""
Victor Chowdhury \u2014 personal brand site.

Deliberately simple: this is a static-content personal website (the
content only changes when Victor updates his resume), so there's no
database here \u2014 adding SQLite for content that never mutates at runtime
would be pure ceremony. FastAPI + Jinja2 is used so the page is easy to
extend later (a contact form, a blog, download analytics) without a
rewrite.
"""
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import Response
from starlette.types import Scope

import content

# Extensions that are safe to serve publicly from the flat project root.
# Everything else (.py, .md, .txt, .gitignore, etc.) 404s even though it
# physically lives in the same folder as the assets below.
_SERVABLE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".ico", ".pdf", ".css", ".js"}


class AssetOnlyStaticFiles(StaticFiles):
    """StaticFiles that only serves known asset extensions.

    Mounting the whole project root under /static is what keeps this a
    truly single-folder project (no separate static/ subdirectory to
    maintain) -- this subclass is the guardrail that stops main.py,
    content.py, README.md, etc. from being fetchable over HTTP as a result.
    """

    def get_path(self, scope: Scope) -> str:
        path = super().get_path(scope)
        if not any(path.lower().endswith(ext) for ext in _SERVABLE_EXTENSIONS):
            return ""  # empty path -> StaticFiles treats it as not-found
        return path


app = FastAPI(title="Victor Chowdhury")
# Flat, single-folder project: assets (images/résumés) live at the project
# root alongside main.py/content.py, so "static" here is a URL prefix only,
# not a real subdirectory on disk. AssetOnlyStaticFiles keeps source/config
# files out of reach despite sharing the same folder.
app.mount("/static", AssetOnlyStaticFiles(directory="."), name="static")
templates = Jinja2Templates(directory=".")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "profile": content.PROFILE,
            "about": content.ABOUT,
            "impact": content.IMPACT,
            "buckets": content.BUCKETS,
            "timeline": content.TIMELINE,
            "capabilities": content.CAPABILITIES,
            "education": content.EDUCATION,
            "certifications": content.CERTIFICATIONS,
            "recognition": content.RECOGNITION,
            "resumes": content.RESUMES,
            "work_samples": content.WORK_SAMPLES,
            "articles": content.ARTICLES,
            "certificates": content.CERTIFICATES,
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8420, reload=True)
