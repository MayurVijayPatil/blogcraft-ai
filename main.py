# main.py

from blog.chains import title_chain, outline_chain, blog_chain
from blog.file_writer import save_blog


# ─────────────────────────────────────────────
# OPTIONS MENUS
# ─────────────────────────────────────────────

TONE_OPTIONS = {
    "1": "Casual",
    "2": "Professional",
    "3": "Humorous",
    "4": "Inspirational"
}

LENGTH_OPTIONS = {
    "1": "Short",
    "2": "Medium",
    "3": "Long"
}


def pick_option(prompt_text: str, options: dict) -> str:
    """Display a numbered menu and return the user's chosen value."""
    print(f"\n{prompt_text}")
    for key, value in options.items():
        print(f"   {key}. {value}")

    while True:
        choice = input("   👉 Enter number: ").strip()
        if choice in options:
            return options[choice]
        print(f"   ⚠️  Invalid choice. Pick from: {list(options.keys())}")


def get_user_options() -> dict:
    """Collect all user options: tone, length, language."""

    print("\n⚙️  Configure your blog options:")
    print("-" * 35)

    tone     = pick_option("🎨 Select Tone:", TONE_OPTIONS)
    length   = pick_option("📏 Select Length:", LENGTH_OPTIONS)

    print("\n🌍 Language:")
    language = input("   👉 Enter language (e.g. English, Urdu, French): ").strip()

    if not language:
        language = "English"

    return {
        "tone"    : tone,
        "length"  : length,
        "language": language
    }


# ─────────────────────────────────────────────
# ⭐ NEW — Stream the blog and collect full text
# ─────────────────────────────────────────────

def stream_blog(inputs: dict) -> str:
    """
    Stream the blog post chunk by chunk to the terminal.
    Collects all chunks and returns the full blog as a string.

    Args:
        inputs : dict with title, outline, tone, length, language

    Returns:
        full_blog : the complete blog post as a plain string
    """
    full_blog = ""                         # we'll build the full text here

    print("\n" + "=" * 55)
    print("📝 GENERATING BLOG POST")
    print("=" * 55 + "\n")

    for chunk in blog_chain.stream(inputs):
        print(chunk, end="", flush=True)   # print each chunk instantly
        full_blog += chunk                 # collect chunk into full string

    print("\n\n" + "=" * 55)              # newline after blog finishes

    return full_blog                       # return complete text for saving


# ─────────────────────────────────────────────
# BLOG GENERATION PIPELINE
# ─────────────────────────────────────────────

def generate_blog(topic: str, options: dict) -> tuple[str, str]:
    """
    Run the full 3-step blog generation pipeline.

    Args:
        topic   : The blog topic from the user
        options : Dict containing tone, length, language

    Returns:
        (title, full_blog_content) as a tuple
    """

    # Step 1 — Generate Title (invoke — fast)
    print("\n🔵 Step 1/3 — Generating title...")
    title = title_chain.invoke({
        "topic"   : topic,
        "tone"    : options["tone"],
        "language": options["language"]
    })
    print(f"   ✅ Title: {title}")

    # Step 2 — Generate Outline (invoke — fast)
    print("\n🟡 Step 2/3 — Generating outline...")
    outline = outline_chain.invoke({
        "title"   : title,
        "tone"    : options["tone"],
        "length"  : options["length"],
        "language": options["language"]
    })
    print("   ✅ Outline created!")
    if hasattr(outline, "sections"):
        for i, sec in enumerate(outline.sections, 1):
            print(f"      📌 {i}. {sec.heading}")

    # Step 3 — Stream Blog (stream — word by word 🌊)
    print("\n🟢 Step 3/3 — Streaming blog post...")

    outline_text = outline.to_markdown() if hasattr(outline, "to_markdown") else outline
    blog = stream_blog({
        "title"   : title,
        "outline" : outline_text,
        "tone"    : options["tone"],
        "length"  : options["length"],
        "language": options["language"]
    })

    return title, blog


# ─────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────

def main():
    print("=" * 55)
    print("      🤖 AUTOMATED BLOG GENERATOR — LangChain + Groq")
    print("=" * 55)
    print("Type a blog topic, or 'q' to quit.\n")

    while True:
        try:
            topic = input("📌 Enter blog topic: ").strip()

            if topic.lower() in ("q", "quit", "exit"):
                print("\n👋 Goodbye! Happy blogging!")
                break

            if not topic:
                print("⚠️  Topic cannot be empty. Try again.\n")
                continue

            options = get_user_options()

            print(f"\n📋 Generating blog with:")
            print(f"   Topic    : {topic}")
            print(f"   Tone     : {options['tone']}")
            print(f"   Length   : {options['length']}")
            print(f"   Language : {options['language']}")

            title, blog = generate_blog(topic, options)

            filepath = save_blog(title, blog)
            print(f"💾 Blog saved to: {filepath}")
            print("-" * 55 + "\n")

        except KeyboardInterrupt:
            print("\n\n👋 Interrupted. Goodbye!")
            break

        except Exception as e:
            print(f"\n❌ Something went wrong: {e}")
            print("   Try again or check your API key / internet.\n")


if __name__ == "__main__":
    main()
