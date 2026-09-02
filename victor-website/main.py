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

import content

app = FastAPI(title="Victor Chowdhury")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


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
