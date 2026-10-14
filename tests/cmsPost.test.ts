import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blocksToMarkdown, dateInZone, findExternalLinks, rowToPost, type CmsRow } from '../src/cms/cmsPost';

test('blocks convert to the markdown the site renderer reads', () => {
  const md = blocksToMarkdown([
    { type: 'h1', text: 'Top' },
    { type: 'h2', text: 'Section' },
    { type: 'h3', text: 'Sub' },
    { type: 'p', text: 'Some **bold**, *italic*, __underlined__ and ~~struck~~ text.' },
    { type: 'ul', items: ['one', 'two'] },
    { type: 'ol', items: ['first', 'second'] },
    { type: 'blockquote', text: 'Quoted' },
    { type: 'code', text: 'const a = 1;', language: 'ts' },
    { type: 'hr' },
    { type: 'table', headers: ['A', 'B|C'], rows: [['1', '2']] },
    { type: 'image', src: 'https://x.supabase.co/storage/v1/object/public/blog-images/a.png', alt: 'Alt', caption: 'Cap' },
  ]);
  assert.equal(
    md,
    [
      '## Top', // the post title is the page's only h1
      '## Section',
      '### Sub',
      'Some **bold**, *italic*, underlined and struck text.',
      '- one\n- two',
      '1. first\n2. second',
      '> Quoted',
      '```ts\nconst a = 1;\n```',
      '---',
      '| A | B/C |\n| --- | --- |\n| 1 | 2 |',
      '![Alt](https://x.supabase.co/storage/v1/object/public/blog-images/a.png "Cap")',
    ].join('\n\n')
  );
});

test('FAQ items become the section the site turns into FAQPage schema', () => {
  const md = blocksToMarkdown([{ type: 'p', text: 'Body.' }], [{ q: 'Why?', a: 'Because.' }, { q: 'Empty?', a: ' ' }]);
  assert.equal(md, 'Body.\n\n## Frequently Asked Questions\n\n### Why?\n\nBecause.');
});

test('external links become plain text, fwdpod.com links become site-relative', () => {
  const blocks = [
    { type: 'p' as const, text: 'See [Gartner](https://www.gartner.com/x) and [our pods](https://www.fwdpod.com/catalogue) and [MCP](/insights/what-is-mcp).' },
  ];
  assert.equal(blocksToMarkdown(blocks), 'See Gartner and [our pods](/catalogue) and [MCP](/insights/what-is-mcp).');
  assert.deepEqual(findExternalLinks(blocks), ['https://www.gartner.com/x']);
});

const row: CmsRow = {
  id: 'abc',
  title: 'Title',
  slug: 'a-post',
  excerpt: 'Short excerpt.',
  meta_description: 'The meta description.',
  status: 'scheduled',
  // 20:00 UTC on 31 Dec is already 1 Jan in India
  publish_at: '2026-12-31T20:00:00Z',
  time_zone: 'Asia/Kolkata',
  category: 'Agentic AI & LLM Engineering',
  tags: [' a ', 'b'],
  related_blogs: ['what-is-mcp'],
  redirect_from: ['old-slug', 'a-post'],
  featured_image: 'https://www.fwdpod.com/blog-images/x.jpg',
  content: [{ type: 'p', text: 'Hello.' }],
};

test('a row becomes a post: date in its own time zone, meta description as the card text', () => {
  const post = rowToPost(row);
  assert.equal(post.date, '2027-01-01');
  assert.equal(post.description, 'The meta description.');
  assert.equal(post.image, '/blog-images/x.jpg');
  assert.deepEqual(post.keywords, ['a', 'b']);
  assert.deepEqual(post.redirectFrom, ['old-slug']); // never redirects to itself
  assert.equal(post.markdown, 'Hello.');
});

test('dateInZone', () => {
  assert.equal(dateInZone('2026-10-09T23:30:00Z', 'UTC'), '2026-10-09');
  assert.equal(dateInZone('2026-10-09T23:30:00Z', 'Asia/Kolkata'), '2026-10-10');
});
