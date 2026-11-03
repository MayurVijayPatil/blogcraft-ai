import os
import re
from datetime import datetime


def slugify(text: str) -> str:
    """
    Convert a title into a safe filename.
    Example: "The Future of AI! (2026)" → "the_future_of_ai_2026"
    """
    # Lowercase everything
    text = text.lower()
    # Replace anything that's NOT a letter, number, or space with a space
    text = re.sub(r"[^\w\s]", "", text)
    # Replace whitespace (spaces, tabs) with underscores
    text = re.sub(r"\s+", "_", text.strip())

    return text


def save_blog(title: str, content: str, output_dir: str = "outputs") -> str:
    """
    Save the generated blog post to a .md file.

    Args:
        title      : Blog title (used to name the file)
        content    : Full blog post content in markdown
        output_dir : Folder to save into (default: 'outputs/')

    Returns:
        filepath   : The full path of the saved file (string)
    """

    # Step 1: Make sure the output folder exists
    os.makedirs(output_dir, exist_ok=True)

    # Step 2: Build a unique filename using title + timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    slug = slugify(title)
    filename = f"{slug}_{timestamp}.md"
    filepath = os.path.join(output_dir, filename)

    # Step 3: Write the content to the file
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return filepath
