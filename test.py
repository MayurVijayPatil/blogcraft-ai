# test_llm.py

from blog.file_writer import slugify, save_blog

# ── Test 1: slugify ──────────────────────────
print("Testing slugify...")
print(slugify("The Future of AI! (2026)"))
# Expected: the_future_of_ai_2026

print(slugify("  Python & LangChain: A Love Story?  "))
# Expected: python_langchain_a_love_story

print()

# ── Test 2: save_blog ────────────────────────
print("Testing save_blog...")

fake_title = "Test Blog Post"
fake_content = "# Test Blog Post\n\nThis is a test.\n\n## Section 1\n\nHello World!"

filepath = save_blog(fake_title, fake_content)

print(f"✅ Blog saved to: {filepath}")

# ── Verify the file was created ──────────────
with open(filepath, "r", encoding="utf-8") as f:
    print("\n📄 File contents:")
    print(f.read())
