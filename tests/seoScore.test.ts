import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DESCRIPTION_RANGE,
  TITLE_SUFFIX,
  keywordIndex,
  scoreMetaDescription,
  scoreSeoTitle,
  suggestMetaDescriptions,
  suggestSeoTitles,
  type SeoContext,
} from '../src/admin/utils/seoScore';

const ctx: SeoContext = {
  title: 'When to Hire a Forward Deployed Engineer (and When You Genuinely Do Not Need One)',
  excerpt:
    'Hire a forward deployed engineer when an AI system has to work inside your specific data, tools and workflows, and nobody on your team owns getting it there.',
  focusKeyword: 'forward deployed engineer',
  bodyText:
    'A forward deployed engineer closes the gap between a demo and production. Most AI projects stall at integration, not at model quality. Two or more of the signals below usually justify the conversation.',
  others: [{ title: 'What Is a Forward Deployed Engineer?', seoTitle: 'What Is a Forward Deployed Engineer? The 2026 Definition', description: 'A definition.' }],
};

const repeat = (s: string, n: number) => s.slice(0, n).padEnd(n, '.');

test('a 212-character boilerplate description without the keyword is red', () => {
  const desc = repeat(
    'In this article we will discuss many things that are covered and explained in detail, and everything you need to know is given here so that it is understood by all readers who visit the page today and come back again tomorrow.',
    212
  );
  assert.equal(desc.length, 212);
  const r = scoreMetaDescription(desc, ctx);
  assert.equal(r.band, 'poor');
  assert.ok(r.score < 50, `score ${r.score}`);
  const length = r.rules.find((x) => x.id === 'desc-length')!;
  assert.equal(length.points, 0);
  assert.match(length.problem!, /212 characters/);
  assert.match(length.why, /160/);
});

test('length alone costs 30 of 100: an otherwise perfect 212-char description is amber, not red', () => {
  const desc =
    'Learn when to hire a forward deployed engineer: seven signals you need one, five signs you do not, the alternative that fits each case, and the questions to settle before you commit any budget to it.'.padEnd(212, ' x').slice(0, 212);
  const r = scoreMetaDescription(desc, ctx);
  assert.equal(r.score, 70);
  assert.equal(r.band, 'needs-work');
});

test('Suggest returns 3 descriptions, each 120–160 chars, containing the focus keyword, all passing', () => {
  const options = suggestMetaDescriptions(ctx);
  assert.equal(options.length, 3);
  for (const o of options) {
    assert.ok(o.length >= DESCRIPTION_RANGE[0] && o.length <= DESCRIPTION_RANGE[1], `${o.length}: ${o.text}`);
    assert.ok(keywordIndex(o.text, ctx.focusKeyword) >= 0, o.text);
    assert.equal(scoreMetaDescription(o.text, ctx).score, o.score);
    assert.ok(o.score >= 80);
  }
});

test('Suggest returns SEO titles that fit 50–60 chars with the suffix and front-load the keyword', () => {
  const options = suggestSeoTitles(ctx);
  assert.ok(options.length >= 1);
  for (const o of options) {
    const shown = `${o.text}${TITLE_SUFFIX}`.length;
    assert.ok(shown >= 50 && shown <= 60, `${shown}: ${o.text}`);
    assert.ok(keywordIndex(o.text, ctx.focusKeyword) < 30, o.text);
    assert.ok(o.score >= 80);
  }
});

test('title length is measured as Google shows it, brand suffix included', () => {
  const r = scoreSeoTitle('Forward Deployed Engineer: When You Need One', ctx);
  assert.equal(r.length, 'Forward Deployed Engineer: When You Need One'.length + TITLE_SUFFIX.length);
});

test('a title copied from the H1 or another post fails the uniqueness rule', () => {
  const h1 = scoreSeoTitle(ctx.title, ctx).rules.find((x) => x.id === 'title-unique')!;
  assert.equal(h1.passed, false);
  const other = scoreSeoTitle('What Is a Forward Deployed Engineer? The 2026 Definition', ctx).rules.find((x) => x.id === 'title-unique')!;
  assert.equal(other.passed, false);
});

test('without a focus keyword the keyword rules are skipped, never guessed', () => {
  const r = scoreSeoTitle('Forward Deployed Engineer: When You Need One', { ...ctx, focusKeyword: '' });
  assert.equal(r.needsKeyword, true);
  assert.ok(r.rules.filter((x) => x.id.includes('keyword')).every((x) => x.skipped));
});

test('stuffing, ALL-CAPS and stacked separators fail the clean rule', () => {
  const stuffed = scoreSeoTitle('Forward Deployed Engineer | Forward Deployed Engineer | Forward Deployed Engineer', ctx);
  assert.equal(stuffed.rules.find((x) => x.id === 'title-clean')!.passed, false);
  const caps = scoreSeoTitle('HIRE A FORWARD DEPLOYED ENGINEER TODAY NOW', ctx);
  assert.equal(caps.rules.find((x) => x.id === 'title-clean')!.passed, false);
});

test('score bands: 80+ good, 50–79 needs work, under 50 poor', () => {
  const good = scoreSeoTitle('Forward Deployed Engineer: 7 Signals You Need One', ctx);
  assert.equal(good.band, 'good');
  assert.equal(scoreSeoTitle('', ctx).band, 'poor');
});
