import { Link } from 'react-router-dom';

/**
 * Markdown for article bodies.
 *
 * Supports what the articles actually use: headings (h2/h3/h4), paragraphs,
 * bullet and numbered lists, tables, fenced code blocks, blockquotes, rules,
 * and the inline set (links, bold, italic, code). Small on purpose — articles
 * stay plain .md files in content/blog/ with no rendering dependency to install.
 *
 * Tables scroll horizontally on narrow screens rather than stretching the
 * page. External links open in a new tab; internal ones use the router so
 * they stay client-side navigations and crawlable <a href> in the HTML.
 */

// One alternation per inline form, kept in precedence order.
// A markdown URL may itself contain a balanced pair of parentheses.
const INLINE_PATTERN = /(\[[^\]]+\]\((?:[^()\s]|\([^()\s]*\))+\)|\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;

/** Markdown stripped back to readable text, for ids and schema strings. */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\((?:[^()\s]|\([^()\s]*\))*\)/g, '')
    .replace(/\[([^\]]+)\]\((?:[^()\s]|\([^()\s]*\))*\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function headingId(text: string): string {
  return toPlainText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const LINK_CLASS =
  'text-[#0066FF] underline underline-offset-2 decoration-[#0066FF]/30 hover:decoration-[#0066FF] transition-colors';

export function renderInline(text: string) {
  return text.split(INLINE_PATTERN).map((part, index) => {
    if (!part) return null;

    const link = part.match(/^\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) {
        return (
          <Link key={index} to={href} className={LINK_CLASS}>
            {renderInline(label)}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          {renderInline(label)}
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="font-mono text-[0.85em] bg-zinc-100 px-1.5 py-0.5 rounded">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isTableBlock(lines: string[]): boolean {
  return (
    lines.length >= 2 &&
    lines[0].trim().startsWith('|') &&
    /^\|[\s:\-|]+\|$/.test(lines[1].trim())
  );
}

function renderTable(lines: string[], key: number) {
  const header = splitRow(lines[0]);
  const rows = lines.slice(2).filter(line => line.trim().startsWith('|')).map(splitRow);

  return (
    <div key={key} className="not-prose overflow-x-auto rounded-2xl border border-zinc-200 my-2">
      <table className="w-full min-w-[560px] border-collapse text-left font-sans text-[13px]">
        <thead>
          <tr className="bg-zinc-50">
            {header.map((cell, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-3 font-semibold text-zinc-900 border-b border-zinc-200 align-bottom"
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-zinc-100 last:border-0">
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-3 align-top text-zinc-700 leading-relaxed">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const IMAGE_PATTERN = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/;

// A fenced code block. Lifted out before the body is split on blank lines,
// because code keeps its own blank lines.
const FENCE_PATTERN = /^```[^\n]*\n([\s\S]*?)\n```[ \t]*$/gm;

function renderCode(code: string, key: number) {
  return (
    <pre
      key={key}
      className="not-prose overflow-x-auto rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-[12.5px] leading-relaxed p-5 my-2"
    >
      <code>{code}</code>
    </pre>
  );
}

/** Renders a markdown body into elements. */
export default function renderMarkdown(markdown: string) {
  const source = markdown.replace(/\r\n/g, '\n');
  const blocks: Array<string | { code: string }> = [];
  let last = 0;
  for (const match of source.matchAll(FENCE_PATTERN)) {
    blocks.push(...source.slice(last, match.index).split(/\n{2,}/));
    blocks.push({ code: match[1] });
    last = match.index! + match[0].length;
  }
  blocks.push(...source.slice(last).split(/\n{2,}/));

  return blocks
    .map((block, index) => {
      if (typeof block !== 'string') return renderCode(block.code, index);
      const trimmed = block.trim();
      if (!trimmed) return null;
      const lines = trimmed.split('\n');

      if (isTableBlock(lines)) return renderTable(lines, index);

      // A paragraph that is only an image: ![alt](src "optional caption")
      const image = trimmed.match(IMAGE_PATTERN);
      if (image) {
        const [, alt, src, caption] = image;
        return (
          <figure key={index} className="not-prose my-2">
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50"
            />
            {caption && (
              <figcaption className="mt-2 text-center text-xs text-zinc-500">{caption}</figcaption>
            )}
          </figure>
        );
      }

      if (/^(---|\*\*\*|___)$/.test(trimmed)) {
        return <hr key={index} className="border-zinc-200" />;
      }

      if (trimmed.startsWith('#### ')) {
        const text = trimmed.slice(5).trim();
        return (
          <h4
            key={index}
            id={headingId(text)}
            className="font-sans text-base font-semibold text-zinc-900 tracking-tight pt-2"
          >
            {renderInline(text)}
          </h4>
        );
      }
      if (trimmed.startsWith('### ')) {
        const text = trimmed.slice(4).trim();
        return (
          <h3
            key={index}
            id={headingId(text)}
            className="font-sans text-lg md:text-xl font-semibold text-zinc-900 tracking-tight pt-4 scroll-mt-24"
          >
            {renderInline(text)}
          </h3>
        );
      }
      // Both ## and # render as h2: the post title is already the page's h1.
      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const text = trimmed.replace(/^#{1,2}\s+/, '').trim();
        return (
          <h2
            key={index}
            id={headingId(text)}
            className="font-sans text-xl md:text-2xl font-bold text-zinc-900 tracking-tight pt-6 pb-2 border-b border-zinc-100 scroll-mt-24"
          >
            {renderInline(text)}
          </h2>
        );
      }

      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={index}
            className="border-l-2 border-[#0066FF]/40 pl-5 text-zinc-600 italic"
          >
            {renderInline(lines.map(line => line.replace(/^>\s?/, '')).join(' '))}
          </blockquote>
        );
      }

      if (/^[*-]\s/.test(trimmed)) {
        return (
          <ul key={index} className="space-y-2.5 font-sans pl-5 list-disc text-[14px] text-zinc-700">
            {joinWrappedItems(lines, /^[*-]\s+/).map((item, i) => (
              <li key={i} className="leading-relaxed pl-1">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      }

      if (/^\d+[.)]\s/.test(trimmed)) {
        return (
          <ol key={index} className="space-y-2.5 font-sans pl-5 list-decimal text-[14px] text-zinc-700">
            {joinWrappedItems(lines, /^\d+[.)]\s+/).map((item, i) => (
              <li key={i} className="leading-relaxed pl-1">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      }

      return (
        <p key={index} className="leading-[1.75]">
          {renderInline(lines.join(' '))}
        </p>
      );
    });
}

/** List items may wrap across source lines; continuation lines join the item. */
function joinWrappedItems(lines: string[], marker: RegExp): string[] {
  const items: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (marker.test(trimmed)) items.push(trimmed.replace(marker, ''));
    else if (items.length) items[items.length - 1] += ` ${trimmed}`;
  }
  return items;
}
