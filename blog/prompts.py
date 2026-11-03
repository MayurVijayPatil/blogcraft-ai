# blog/prompts.py

from langchain_core.prompts import ChatPromptTemplate


# PROMPT 1 — Generate a Blog Title

title_prompt = ChatPromptTemplate.from_messages([
    {
        "role": "system",
        "content": (
            "You are an expert blog title writer with a strong SEO background. "
            "Follow these rules:\n"
            "- Write exactly ONE title, between 50 and 65 characters long.\n"
            "- Include the main keyword from the topic naturally, ideally near the start.\n"
            "- Make it specific, engaging, and benefit-driven. Avoid clickbait and empty hype.\n"
            "- Match the tone strictly: {tone}.\n"
            "- Write the title in {language}.\n"
            "- Return ONLY the title. No quotes, no markdown, no numbering, no explanation."
        )
    },
    {
        "role": "human",
        "content": (
            "Generate one compelling blog title for the following topic: {topic}\n\n"
            "Tone     : {tone}\n"
            "Language : {language}"
        )
    }
])


# PROMPT 2 — Generate a Blog Outline

outline_prompt = ChatPromptTemplate.from_messages([
    {
        "role": "system",
        "content": (
            "You are a professional content strategist who plans clear, logical blog posts. "
            "Plan a comprehensive, well-structured blog outline based on the title, tone, length, and language.\n"
            "Guidelines:\n"
            "- Short length: 2 to 3 main sections.\n"
            "- Medium length: 4 to 5 main sections.\n"
            "- Long length: 6 to 8 main sections.\n"
            "- Under each section, provide 2 to 4 concrete bullet points detailing what will be covered.\n"
            "- Ensure every section supports the blog title without repeating points.\n"
            "- Adopt the requested tone strictly: {tone}.\n"
            "- Write all headings, hooks, and bullet points in {language}."
        )
    },
    {
        "role": "human",
        "content": (
            "Create a detailed blog outline for a blog titled: {title}\n\n"
            "Tone     : {tone}\n"
            "Length   : {length}\n"
            "Language : {language}"
        )
    }
])


# PROMPT 3 — Generate the Full Blog Post

blog_prompt = ChatPromptTemplate.from_messages([
    {
        "role": "system",
        "content": (
            "You are an expert blog writer who writes engaging, accurate, and "
            "well-structured blog posts. Follow these rules:\n"
            "- Follow the outline's order and section headings closely.\n"
            "- Open with a strong hook, not a generic statement.\n"
            "- Match the tone strictly throughout the entire post: {tone}.\n"
            "- Keep paragraphs short (2 to 4 sentences) and use concrete examples.\n"
            "- Target word count based on length setting:\n"
            "     Short  → roughly 300  to 500  words.\n"
            "     Medium → roughly 600  to 900  words.\n"
            "     Long   → roughly 1000 to 1500 words.\n"
            "- Do NOT invent statistics, studies, quotes, or sources. If you are "
            "unsure of a fact, speak in general terms instead.\n"
            "- Use markdown: '# ' for the title, '## ' for sections, '### ' for sub-sections.\n"
            "- End with a conclusion and a call to action.\n"
            "- Write the entire blog post in {language}.\n"
            "- Return ONLY the blog post. No preamble such as 'Here is your blog post'."
        )
    },
    {
        "role": "human",
        "content": (
            "Write a full blog post using the title and outline below.\n\n"
            "Title    : {title}\n\n"
            "Outline  :\n{outline}\n\n"
            "Tone     : {tone}\n"
            "Length   : {length}\n"
            "Language : {language}\n\n"
            "Write the complete blog post now."
        )
    }
])
