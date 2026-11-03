import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from blog.chains import title_chain,outline_chain,blog_chain
from blog.file_writer import save_blog


app = FastAPI(title = "Blog Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"]
)

app.mount(
    "/app",
    StaticFiles(directory= "frontend", html = True),
     name = "frontend"
)


class BlogRequest(BaseModel):
    topic : str
    tone : str
    length : str
    language : str = "English"



# ── Route: Stream Full Blog ─────────────────────────────
@app.post("/generate/blog/stream")
async def stream_blog(req: BlogRequest):

    async def event_generator():

        # ── Step 1: Generate Title ──────────────────────
        title = title_chain.invoke({
            "topic"   : req.topic,
            "tone"    : req.tone,
            "language": req.language
        })
        clean_title = title.strip().strip('"').strip("'")
        yield f"data: {json.dumps({'event': 'title', 'data': clean_title})}\n\n"

        # ── Step 2: Generate Outline (Pydantic Structured Output) ───
        outline_obj = outline_chain.invoke({
            "title"   : clean_title,
            "tone"    : req.tone,
            "length"  : req.length,
            "language": req.language
        })
        outline_markdown = outline_obj.to_markdown() if hasattr(outline_obj, "to_markdown") else str(outline_obj)
        outline_data = outline_obj.model_dump() if hasattr(outline_obj, "model_dump") else outline_obj
        yield f"data: {json.dumps({'event': 'outline_done', 'data': outline_data})}\n\n"

        # ── Step 3: Stream Blog Chunks ──────────────────
        full_blog = ""

        for chunk in blog_chain.stream({
            "title"   : clean_title,
            "outline" : outline_markdown,
            "tone"    : req.tone,
            "length"  : req.length,
            "language": req.language
        }):
            full_blog += chunk
            yield f"data: {json.dumps({'event': 'chunk', 'data': chunk})}\n\n"

        # ── Step 4: Save & Signal Done ──────────────────
        filepath = save_blog(clean_title, full_blog)
        yield f"data: {json.dumps({'event': 'done', 'filepath': filepath})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
