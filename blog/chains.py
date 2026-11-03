from langchain_core.output_parsers import StrOutputParser
from blog.llm import get_llm
from blog.prompts import title_prompt, outline_prompt, blog_prompt
from blog.schemas import BlogOutline

parser = StrOutputParser()

llm = get_llm()

# CHAIN 1 — Title Chain (returns clean string title)
title_chain = title_prompt | llm | parser

# CHAIN 2 — Outline Chain (Structured Output with Pydantic)
# Returns a validated BlogOutline object with sections, bullet points, and hooks
outline_chain = outline_prompt | llm.with_structured_output(BlogOutline)

# CHAIN 3 — Blog Chain (Streams Markdown text chunk-by-chunk)
blog_chain = blog_prompt | llm | parser





