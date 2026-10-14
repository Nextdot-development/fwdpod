import type { BlogBlock } from "@admin/types/blog";

/** Strip the inline formatting tokens so suggestions read as plain prose. */
function plain(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [label](url) → label
    .replace(/(\*\*|__|~~|\*)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Flatten a content block to plain text (for word counts and summaries). */
export function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "h1":
    case "h2":
    case "h3":
    case "p":
    case "blockquote":
    case "code":
      return plain((block as { text: string }).text ?? "");
    case "ul":
    case "ol":
      return block.items.map(plain).join(" ");
    case "table":
      return [...block.headers, ...block.rows.flat()].map(plain).join(" ");
    case "image":
      return plain(block.caption ?? "");
    case "faq":
      return block.items.map((f) => `${f.q} ${f.a}`).join(" ");
    default:
      return "";
  }
}

/** Clip a string to a max length at the nearest word boundary (no ellipsis). */
function clipWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
}

/** Reading time at ~200 wpm, matching the public site's formula. */
export function readTimeFromBlocks(blocks: BlogBlock[], excerpt = ""): string {
  const text = [excerpt, ...blocks.map(blockText)].join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/**
 * ALT-text suggestion for the featured image — a concise, descriptive phrase
 * derived from the title (and category, when set).
 */
export function suggestImageAlt(title: string, category = ""): string {
  const base = plain(title).replace(/[?:.!]+$/g, "");
  if (!base) return "";
  return clipWords(category ? `${base} — ${category}` : base, 120);
}
