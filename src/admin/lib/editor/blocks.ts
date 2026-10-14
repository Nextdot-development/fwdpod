/**
 * Bridge between the TipTap/ProseMirror document model and the site's
 * structured BlogBlock[] schema. Blogs are stored as BlogBlock[] JSON — never
 * raw HTML — so the public renderer (and the Feature 7 publish pipeline) can
 * consume them 1:1. Inline formatting is encoded as lightweight tokens that
 * match the public inline parser: **bold** *italic* __underline__ ~~strike~~
 * and [label](url).
 */
import type { BlogBlock } from "@admin/types/blog";

/* eslint-disable @typescript-eslint/no-explicit-any */
type PMNode = any;

// ---------------------------------------------------------------------------
// TipTap doc  ->  BlogBlock[]
// ---------------------------------------------------------------------------

function serializeInline(nodes: PMNode[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "hardBreak") return " ";
      if (n.type !== "text" || !n.text) return "";
      let t: string = n.text;
      const marks: PMNode[] = n.marks ?? [];
      const has = (name: string) => marks.some((m) => m.type === name);
      // innermost -> outermost, matching how the tokens nest on parse-back
      if (has("italic")) t = `*${t}*`;
      if (has("bold")) t = `**${t}**`;
      if (has("underline")) t = `__${t}__`;
      if (has("strike")) t = `~~${t}~~`;
      const link = marks.find((m) => m.type === "link");
      if (link?.attrs?.href) t = `[${t}](${link.attrs.href})`;
      return t;
    })
    .join("");
}

// Plain text of inline nodes, ignoring marks. Headings are stored unformatted
// (they are already styled), so no bold/italic tokens leak into a heading.
function plainInline(nodes: PMNode[] | undefined): string {
  if (!nodes) return "";
  return nodes.map((n) => (n.type === "text" ? n.text ?? "" : n.type === "hardBreak" ? " " : "")).join("");
}

/** Text of a list item (its child paragraphs joined). */
function listItemText(li: PMNode): string {
  return (li.content ?? [])
    .filter((c: PMNode) => c.type === "paragraph")
    .map((p: PMNode) => serializeInline(p.content))
    .join(" ")
    .trim();
}

function cellText(cell: PMNode): string {
  return (cell.content ?? [])
    .map((p: PMNode) => serializeInline(p.content))
    .join(" ")
    .trim();
}

export function docToBlocks(doc: PMNode): BlogBlock[] {
  const out: BlogBlock[] = [];
  for (const node of doc?.content ?? []) {
    switch (node.type) {
      case "heading": {
        const level = node.attrs?.level ?? 2;
        const text = plainInline(node.content).trim();
        if (!text) break;
        out.push({ type: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text });
        break;
      }
      case "paragraph": {
        const text = serializeInline(node.content).trim();
        if (text) out.push({ type: "p", text });
        break;
      }
      case "bulletList": {
        const items = (node.content ?? []).map(listItemText).filter(Boolean);
        if (items.length) out.push({ type: "ul", items });
        break;
      }
      case "orderedList": {
        const items = (node.content ?? []).map(listItemText).filter(Boolean);
        if (items.length) out.push({ type: "ol", items });
        break;
      }
      case "blockquote": {
        const text = (node.content ?? [])
          .map((p: PMNode) => serializeInline(p.content))
          .join(" ")
          .trim();
        if (text) out.push({ type: "blockquote", text });
        break;
      }
      case "codeBlock": {
        const text = (node.content ?? []).map((t: PMNode) => t.text ?? "").join("");
        out.push({ type: "code", text, ...(node.attrs?.language ? { language: node.attrs.language } : {}) });
        break;
      }
      case "horizontalRule":
        out.push({ type: "hr" });
        break;
      case "image":
        out.push({
          type: "image",
          src: node.attrs?.src ?? "",
          ...(node.attrs?.alt ? { alt: node.attrs.alt } : {}),
          ...(node.attrs?.caption ? { caption: node.attrs.caption } : {}),
          ...(node.attrs?.width ? { width: Number(node.attrs.width) } : {}),
        });
        break;
      case "table": {
        const rows: PMNode[] = node.content ?? [];
        if (!rows.length) break;
        const headers = (rows[0].content ?? []).map(cellText);
        const body = rows.slice(1).map((r) => (r.content ?? []).map(cellText));
        out.push({ type: "table", headers, rows: body });
        break;
      }
      default:
        break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// BlogBlock[]  ->  TipTap doc
// ---------------------------------------------------------------------------

const INLINE_RE = /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(__[^_]+__)|(~~[^~]+~~)|(\*[^*]+\*)/;

function textNode(text: string, marks: PMNode[]): PMNode[] {
  if (!text) return [];
  return [marks.length ? { type: "text", text, marks: marks.map((m) => ({ ...m })) } : { type: "text", text }];
}

/** Parse a token string back into ProseMirror text nodes with marks. */
function parseInline(text: string, marks: PMNode[] = []): PMNode[] {
  const nodes: PMNode[] = [];
  let rest = text;
  while (rest) {
    const m = rest.match(INLINE_RE);
    if (!m || m.index === undefined) {
      nodes.push(...textNode(rest, marks));
      break;
    }
    if (m.index > 0) nodes.push(...textNode(rest.slice(0, m.index), marks));
    const token = m[0];
    if (m[1]) {
      const lm = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      const href = lm[2];
      const linkMark = {
        type: "link",
        attrs: { href, target: href.startsWith("/") ? null : "_blank", rel: "noopener noreferrer" },
      };
      nodes.push(...parseInline(lm[1], [...marks, linkMark]));
    } else if (m[2]) nodes.push(...parseInline(token.slice(2, -2), [...marks, { type: "bold" }]));
    else if (m[3]) nodes.push(...parseInline(token.slice(2, -2), [...marks, { type: "underline" }]));
    else if (m[4]) nodes.push(...parseInline(token.slice(2, -2), [...marks, { type: "strike" }]));
    else if (m[5]) nodes.push(...parseInline(token.slice(1, -1), [...marks, { type: "italic" }]));
    rest = rest.slice(m.index + token.length);
  }
  return nodes;
}

const paragraph = (text: string): PMNode => ({ type: "paragraph", content: parseInline(text) });
const listItem = (text: string): PMNode => ({ type: "listItem", content: [paragraph(text)] });

function cell(type: "tableHeader" | "tableCell", text: string): PMNode {
  return { type, content: [paragraph(text)] };
}

export function blocksToDoc(blocks: BlogBlock[]): PMNode {
  const content: PMNode[] = [];
  for (const b of blocks ?? []) {
    switch (b.type) {
      case "h1":
        content.push({ type: "heading", attrs: { level: 1 }, content: parseInline(b.text) });
        break;
      case "h2":
        content.push({ type: "heading", attrs: { level: 2 }, content: parseInline(b.text) });
        break;
      case "h3":
        content.push({ type: "heading", attrs: { level: 3 }, content: parseInline(b.text) });
        break;
      case "p":
        content.push(paragraph(b.text));
        break;
      case "ul":
        content.push({ type: "bulletList", content: b.items.map(listItem) });
        break;
      case "ol":
        content.push({ type: "orderedList", content: b.items.map(listItem) });
        break;
      case "blockquote":
        content.push({ type: "blockquote", content: [paragraph(b.text)] });
        break;
      case "code":
        content.push({
          type: "codeBlock",
          attrs: { language: b.language ?? null },
          content: b.text ? [{ type: "text", text: b.text }] : [],
        });
        break;
      case "hr":
        content.push({ type: "horizontalRule" });
        break;
      case "image":
        content.push({
          type: "image",
          attrs: { src: b.src, alt: b.alt ?? "", caption: b.caption ?? "", width: b.width ?? null },
        });
        break;
      case "table": {
        const rows: PMNode[] = [];
        if (b.headers.length) rows.push({ type: "tableRow", content: b.headers.map((h) => cell("tableHeader", h)) });
        for (const r of b.rows) rows.push({ type: "tableRow", content: r.map((c) => cell("tableCell", c)) });
        if (rows.length) content.push({ type: "table", content: rows });
        break;
      }
      case "faq":
        // FAQ is edited in its own panel, not in the rich-text body.
        break;
    }
  }
  // ProseMirror requires at least one block node.
  if (content.length === 0) content.push({ type: "paragraph" });
  return { type: "doc", content };
}
