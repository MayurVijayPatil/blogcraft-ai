from typing import List, Optional
from pydantic import BaseModel, Field


class OutlineSection(BaseModel):
    """Represents a single section in the blog outline."""
    heading: str = Field(
        ...,
        description="The section title/heading, e.g. 'Overview of Renewable Energy' or 'Key Benefits'"
    )
    key_points: List[str] = Field(
        ...,
        description="2 to 4 bullet points detailing specific arguments, data, or concepts to cover"
    )
    subsections: Optional[List[str]] = Field(
        default=None,
        description="Optional sub-headings if this section requires deeper breakdown"
    )


class BlogOutline(BaseModel):
    """Structured outline for generating a comprehensive blog post."""
    title: str = Field(
        ...,
        description="The main blog post title"
    )
    target_audience: str = Field(
        ...,
        description="The primary target audience, e.g. 'General readers', 'Entrepreneurs', 'Tech professionals'"
    )
    introduction_hook: str = Field(
        ...,
        description="A compelling hook and summary of what the reader will learn in the introduction"
    )
    sections: List[OutlineSection] = Field(
        ...,
        description="Ordered list of main sections composing the blog post body"
    )
    conclusion_takeaway: str = Field(
        ...,
        description="Main conclusion takeaway, actionable advice, and closing call to action"
    )

    def to_markdown(self) -> str:
        """Convert the structured outline into clean, well-formatted markdown for subsequent chains."""
        lines = [
            f"# {self.title}",
            f"**Target Audience**: {self.target_audience}",
            f"\n## Introduction",
            self.introduction_hook,
            ""
        ]

        for i, sec in enumerate(self.sections, 1):
            heading_text = sec.heading
            if not heading_text.startswith(f"{i}.") and not heading_text.startswith("#"):
                heading_text = f"{i}. {heading_text}"
            lines.append(f"## {heading_text}")

            for pt in sec.key_points:
                lines.append(f"- {pt}")

            if sec.subsections:
                for sub in sec.subsections:
                    lines.append(f"  ### {sub}")
            lines.append("")

        lines.append("## Conclusion")
        lines.append(self.conclusion_takeaway)

        return "\n".join(lines)

