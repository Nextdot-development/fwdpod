/**
 * Rule-based SEO scoring for the SEO title and meta description, plus
 * deterministic rewrite suggestions.
 *
 * Every point comes from a named rule with a stated reason; nothing is
 * guessed. Rules that need the focus keyword are skipped (and the score is
 * taken over the remaining rules) until the author enters one: a keyword is
 * never invented. Suggestions are built from the post's own title, excerpt
 * and focus keyword, re-scored, and only offered if they pass.
 */

/** Appended to every article <title> by BlogPostView; Google shows it too. */
export const TITLE_SUFFIX = " | Fwdpod";

export const TITLE_RANGE: [number, number] = [50, 60];
export const DESCRIPTION_RANGE: [number, number] = [120, 160];

export type Band = "good" | "needs-work" | "poor";

export interface RuleResult {
  id: string;
  label: string;
  points: number;
  max: number;
  passed: boolean;
  /** Not scored, because it needs the focus keyword. */
  skipped?: boolean;
  /** What was measured, e.g. "Meta description is 212 characters." */
  problem?: string;
  /** The rule and the reason behind it. */
  why: string;
}

export interface ScoreResult {
  score: number;
  band: Band;
  rules: RuleResult[];
  /** Characters measured against the ideal range. */
  length: number;
  ideal: [number, number];
  needsKeyword: boolean;
}

/** Another page on the site, for the uniqueness rules. */
export interface PageRef {
  title?: string;
  seoTitle?: string;
  description?: string;
}

export interface SeoContext {
  /** The H1 / post title. */
  title: string;
  excerpt: string;
  focusKeyword: string;
  /** Text of the first paragraphs of the body, used to lengthen suggestions. */
  bodyText?: string;
  /** Every other post (CMS and markdown). */
  others: PageRef[];
}

export function bandFor(score: number): Band {
  return score >= 80 ? "good" : score >= 50 ? "needs-work" : "poor";
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .trim();

const words = (s: string) => norm(s).split(" ").filter(Boolean);

function keywordRegex(keyword: string, flags = "i"): RegExp | null {
  const parts = words(keyword).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!parts.length) return null;
  return new RegExp(`(^|[^a-z0-9])(${parts.join("[^a-z0-9]+")})(?=$|[^a-z0-9])`, flags);
}

/** Index where the keyword phrase starts, or -1. Case and punctuation insensitive. */
export function keywordIndex(text: string, keyword: string): number {
  const re = keywordRegex(keyword);
  if (!re) return -1;
  const m = re.exec(text);
  return m ? m.index + m[1].length : -1;
}

export function keywordCount(text: string, keyword: string): number {
  const re = keywordRegex(keyword, "gi");
  return re ? [...text.matchAll(re)].length : 0;
}

const POWER_WORDS = [
  "guide", "checklist", "how to", "why", "when", "what", "which", "step", "steps", "ways", "tips",
  "mistakes", "best", "proven", "complete", "practical", "essential", "ultimate", "vs", "versus",
  "explained", "framework", "template", "examples", "cost", "costs", "pricing", "faster", "cheaper",
  "avoid", "save", "free", "signs", "signals", "questions", "rules", "lessons", "playbook", "fix",
  "real", "simple", "easy", "secure", "safely", "without",
];
const POWER_RE = new RegExp(`\\b(${POWER_WORDS.join("|").replace(/ /g, "\\s+")})\\b`, "i");

const CTA_VERBS = [
  "learn", "discover", "find", "get", "see", "compare", "explore", "understand", "build", "choose",
  "decide", "avoid", "plan", "hire", "ship", "start", "use", "read", "check", "master", "cut",
  "reduce", "save", "improve", "know", "protect", "evaluate", "assess", "scale", "deploy", "fix",
  "pick", "move", "run", "spot", "keep",
];
const CTA_RE = new RegExp(`\\b(${CTA_VERBS.join("|")})\\b`, "i");

const BOILERPLATE = [
  "in this article", "in this post", "in this blog", "this article", "this post", "this blog post",
  "read more", "click here", "welcome to", "we will discuss", "we discuss", "everything you need to know",
  "learn more about", "lorem ipsum", "check out our", "this guide", "this page",
];

const STOPWORDS = new Set(
  "a an the and or but of to for in on at by with from as is are was were be been being it its this that these those you your we our how what when why which who do does not no can will".split(" ")
);

function separatorCount(text: string): number {
  return (text.match(/(\s[-–—]\s)|[|•·:]/g) ?? []).length;
}

function isShouting(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 10) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  const capsWords = (text.match(/\b[A-Z]{4,}\b/g) ?? []).length;
  return upper / letters.length > 0.5 || capsWords >= 3;
}

function passiveCount(text: string): number {
  return (text.match(/\b(is|are|was|were|be|been|being)\s+\w+(ed|en)\b/gi) ?? []).length;
}

function sharesSubjectWith(text: string, title: string): boolean {
  const titleWords = new Set(words(title).filter((w) => w.length >= 4 && !STOPWORDS.has(w)));
  return words(text).some((w) => titleWords.has(w));
}

function finish(rules: RuleResult[], length: number, ideal: [number, number], needsKeyword: boolean): ScoreResult {
  const scored = rules.filter((r) => !r.skipped);
  const max = scored.reduce((n, r) => n + r.max, 0);
  const earned = scored.reduce((n, r) => n + r.points, 0);
  const score = max ? Math.round((earned / max) * 100) : 0;
  return { score, band: bandFor(score), rules, length, ideal, needsKeyword };
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

// ---------------------------------------------------------------------------
// SEO title
// ---------------------------------------------------------------------------

export function scoreSeoTitle(seoTitle: string, ctx: SeoContext): ScoreResult {
  const field = seoTitle.trim();
  const shown = `${field}${TITLE_SUFFIX}`;
  const len = field ? shown.length : 0;
  const kw = ctx.focusKeyword.trim();
  const needsKeyword = !kw;
  const rules: RuleResult[] = [];

  // Length of the title as Google shows it, brand suffix included.
  const lenPoints =
    len >= 50 && len <= 60 ? 30
    : (len >= 40 && len <= 49) || (len >= 61 && len <= 65) ? 20
    : (len >= 30 && len <= 39) || (len >= 66 && len <= 70) ? 10
    : 0;
  rules.push({
    id: "title-length",
    label: "Length 50–60 characters",
    points: lenPoints,
    max: 30,
    passed: lenPoints === 30,
    problem: !field
      ? "The SEO title is empty."
      : `The title Google shows ("…${TITLE_SUFFIX}" included) is ${plural(len, "character")}.`,
    why:
      len > 60
        ? "Google truncates titles at about 600px (~60 characters) and replaces the rest with “…”, so the end of yours is cut off. Aim for 50–60 characters including the brand suffix."
        : "Titles under ~50 characters waste space Google would show, and under ~30 look thin. Aim for 50–60 characters including the brand suffix.",
  });

  const idx = kw ? keywordIndex(field, kw) : -1;
  rules.push({
    id: "title-keyword",
    label: "Focus keyword present",
    points: kw && idx >= 0 ? 25 : 0,
    max: 25,
    passed: Boolean(kw) && idx >= 0,
    skipped: needsKeyword,
    problem: needsKeyword ? undefined : `“${kw}” does not appear in the SEO title.`,
    why: "The query the page targets must appear in the title: it is the strongest on-page relevance signal and what searchers scan for.",
  });

  rules.push({
    id: "title-keyword-early",
    label: "Keyword in the first ~30 characters",
    points: kw && idx >= 0 ? (idx < 30 ? 15 : 5) : 0,
    max: 15,
    passed: Boolean(kw) && idx >= 0 && idx < 30,
    skipped: needsKeyword,
    problem: needsKeyword
      ? undefined
      : idx < 0
        ? "The focus keyword is missing, so it cannot be near the start."
        : `The keyword starts at character ${idx + 1}.`,
    why: "Words at the start of a title carry more weight and survive truncation on small screens. Put the keyword first.",
  });

  const nTitle = norm(field);
  const dupOf = ctx.others.find((o) => nTitle && norm(o.seoTitle || o.title || "") === nTitle);
  const copiesH1 = Boolean(nTitle) && nTitle === norm(ctx.title);
  rules.push({
    id: "title-unique",
    label: "Unique (not another page's title or a copy of the H1)",
    points: field && !dupOf && !copiesH1 ? 10 : 0,
    max: 10,
    passed: Boolean(field) && !dupOf && !copiesH1,
    problem: dupOf
      ? `Another post already uses this title: “${dupOf.title}”.`
      : copiesH1
        ? "The SEO title is a verbatim copy of the H1."
        : !field ? "The SEO title is empty." : undefined,
    why: "Duplicate titles compete with each other in results and dilute both. The SEO title is a separate, search-shaped line, not a copy of the headline.",
  });

  const hasHook = /\d/.test(field) || POWER_RE.test(field);
  rules.push({
    id: "title-hook",
    label: "A number, power word or clear benefit",
    points: hasHook ? 10 : 0,
    max: 10,
    passed: hasHook,
    problem: hasHook ? undefined : "No number, power word (guide, how to, vs, mistakes…) or stated benefit.",
    why: "A concrete hook such as a number, “how to”, “guide” or a named benefit lifts click-through rate. Keep it honest, not clickbait.",
  });

  const kwRepeats = kw ? keywordCount(field, kw) : 0;
  const seps = separatorCount(field);
  const shouting = isShouting(field);
  const clean = kwRepeats < 3 && seps <= 1 && !shouting;
  rules.push({
    id: "title-clean",
    label: "No stuffing, ALL-CAPS or extra separators",
    points: field && clean ? 10 : 0,
    max: 10,
    passed: Boolean(field) && clean,
    problem: [
      kwRepeats >= 3 && `The keyword appears ${kwRepeats} times.`,
      seps > 1 && `${plural(seps, "separator")} (| : – —) in the title.`,
      shouting && "Most of the title is in capitals.",
    ].filter(Boolean).join(" ") || undefined,
    why: "Repeating the keyword, shouting in capitals or chaining separators reads as spam: it lowers click-through and can be flagged. One separator at most (the “| Fwdpod” suffix is added for you).",
  });

  return finish(rules, len, TITLE_RANGE, needsKeyword);
}

// ---------------------------------------------------------------------------
// Meta description
// ---------------------------------------------------------------------------

export function scoreMetaDescription(description: string, ctx: SeoContext): ScoreResult {
  const text = description.trim().replace(/\s+/g, " ");
  const len = text.length;
  const kw = ctx.focusKeyword.trim();
  const needsKeyword = !kw;
  const rules: RuleResult[] = [];

  const lenPoints =
    len >= 120 && len <= 160 ? 30 : (len >= 70 && len <= 119) || (len >= 161 && len <= 170) ? 15 : 0;
  rules.push({
    id: "desc-length",
    label: "Length 120–160 characters",
    points: lenPoints,
    max: 30,
    passed: lenPoints === 30,
    problem: !text ? "The meta description is empty." : `Meta description is ${plural(len, "character")}.`,
    why:
      len > 160
        ? "Google shows about 920px on desktop (~155–160 characters) and ~120 on mobile, so the end of yours, often the call to action, is cut off. Aim for 120–160."
        : "Below ~120 characters the snippet leaves space unused that could carry your benefit and call to action. Aim for 120–160.",
  });

  const hasKw = Boolean(kw) && keywordIndex(text, kw) >= 0;
  rules.push({
    id: "desc-keyword",
    label: "Focus keyword present",
    points: hasKw ? 25 : 0,
    max: 25,
    passed: hasKw,
    skipped: needsKeyword,
    problem: needsKeyword ? undefined : `“${kw}” does not appear in the description.`,
    why: "Google bolds the words that match the searcher's query in the snippet, which draws the eye and lifts click-through rate.",
  });

  const hasCta = CTA_RE.test(text);
  rules.push({
    id: "desc-cta",
    label: "Value proposition or call to action",
    points: hasCta ? 20 : 0,
    max: 20,
    passed: hasCta,
    problem: hasCta ? undefined : "No action verb (learn, get, see, compare, choose…) telling the reader what they gain.",
    why: "The description's only job is to earn the click. A verb plus a concrete outcome (“Learn how…”, “See the 7 signals…”) does that; a plain summary does not.",
  });

  const boiler = BOILERPLATE.find((p) => text.toLowerCase().includes(p));
  const passive = passiveCount(text);
  const onTopic = !text || sharesSubjectWith(text, ctx.title) || hasKw;
  const specific = Boolean(text) && !boiler && passive < 2 && onTopic;
  rules.push({
    id: "desc-specific",
    label: "Specific and in active voice",
    points: specific ? 15 : 0,
    max: 15,
    passed: specific,
    problem: !text
      ? "The meta description is empty."
      : boiler
        ? `Generic phrasing: “${boiler}”.`
        : passive >= 2
          ? `${passive} passive constructions (“is used”, “are given”…).`
          : !onTopic
            ? "It shares no key words with the post title, so it may not describe this page."
            : undefined,
    why: "Google rewrites descriptions that are generic or don't match the page, and vague, passive copy earns fewer clicks. Say what this specific post gives the reader, in active voice.",
  });

  const nText = norm(text);
  const dup = ctx.others.find((o) => nText && norm(o.description || "") === nText);
  rules.push({
    id: "desc-unique",
    label: "Unique across pages",
    points: text && !dup ? 10 : 0,
    max: 10,
    passed: Boolean(text) && !dup,
    problem: dup ? `Another post uses the same description: “${dup.title}”.` : !text ? "The meta description is empty." : undefined,
    why: "When several pages share a description, Google ignores it and writes its own snippet for each.",
  });

  return finish(rules, len, DESCRIPTION_RANGE, needsKeyword);
}

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

export interface Suggestion {
  text: string;
  length: number;
  score: number;
  /** Rule ids the option passes. */
  passes: string[];
}

const SMALL = new Set("a an and as at but by for from in of on or the to vs via with".split(" "));

/** Keyword in display casing: the title's casing where it uses the word, else Title Case. */
function displayKeyword(keyword: string, title: string): string {
  const titleWords = title.split(/\s+/);
  return keyword
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const match = titleWords.find((t) => t.replace(/[^\w'-]/g, "").toLowerCase() === w.toLowerCase());
      if (match) {
        const bare = match.replace(/[^\w'-]/g, "");
        if (i === 0) return bare.charAt(0).toUpperCase() + bare.slice(1);
        return SMALL.has(bare.toLowerCase()) ? bare.toLowerCase() : bare;
      }
      if (i > 0 && SMALL.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

const plainText = (s: string) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/(\*\*|__|~~|\*|`)/g, "").replace(/\s+/g, " ").trim();

/**
 * Shorten to at most `max` characters at a clause boundary (comma, colon,
 * semicolon, dash, bracket), or null when that would leave a fragment.
 * Never cuts mid-phrase, so a suggestion always reads as finished.
 */
function clipClause(text: string, max: number): string | null {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  const strong = Math.max(...["; ", ": ", "? ", " — ", " – ", " - ", " ("].map((sep) => cut.lastIndexOf(sep)));
  // A comma only ends a clause when its clause did not open with a subordinate
  // one ("…: if a vendor won't commit, …" must not stop at the comma).
  const comma = cut.lastIndexOf(", ");
  const clauseStart = Math.max(...[": ", "? ", "; ", ". "].map((sep) => t.lastIndexOf(sep, comma))) + 2;
  const subordinate = /^(if|when|whenever|because|although|though|while|since|unless|as|before|after|once|for more)\b/i;
  const commaOk = comma > 0 && !subordinate.test(t.slice(Math.max(clauseStart, 0)).trim());
  const idx = Math.max(strong, commaOk ? comma : -1);
  if (idx < Math.max(12, max * 0.45)) return null;
  return t.slice(0, idx).replace(/[\s,;:–—(-]+$/, "").trim();
}

const sentences = (text: string) =>
  plainText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && !/[#|>]/.test(s) && !/^[-*\d]/.test(s))
    // Split mid-sentence at an abbreviation or a list number ("Rev.", "traits: 1.").
    .filter((s) => !/(\b(Rev|No|Vol|Fig|vs|etc|Inc|Ltd|Dr|Mr|Ms|St)|\d)\.$/i.test(s));

// Lower-cases only an ordinary opening word, so names ("Anthropic …") keep their capital.
const COMMON_OPENERS = new Set(
  "a an the this that these those it its you your we our each every most many some any to in on by for with from when if how what why which who one two three four five six seven eight nine ten so then here there short running building choosing hiring".split(" ")
);
const lowerFirst = (s: string) => {
  const first = s.split(/\s/)[0] ?? "";
  return /^[A-Z][a-z]/.test(first) && COMMON_OPENERS.has(first.toLowerCase().replace(/[^a-z]/g, ""))
    ? s.charAt(0).toLowerCase() + s.slice(1)
    : s;
};
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const endSentence = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

/** The title with the keyword phrase taken out, as a short clause. */
function titleRemainder(title: string, keyword: string): string {
  const re = keywordRegex(keyword);
  let rest = re ? title.replace(re, "$1") : title;
  rest = rest.replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim();
  rest = rest.replace(/^[\s:,;–—|?!.-]+|[\s:,;–—|?!.-]+$/g, "");
  rest = rest.replace(/^(and|or|but|for|the|a|an|to|of|in|on|with)\s+/i, "");
  return rest;
}

/** The first clause of the excerpt, as a title-ready phrase. */
function excerptClause(excerpt: string): string {
  const first = plainText(excerpt).split(/[.;!?]/)[0] ?? "";
  const afterColon = first.includes(":") ? first.split(":").slice(1).join(":") : first;
  return afterColon.split(",")[0].trim();
}

function rank<T extends Suggestion>(items: T[], ideal: [number, number]): T[] {
  const mid = (ideal[0] + ideal[1]) / 2;
  const seen = new Set<string>();
  return items
    .filter((s) => {
      const key = norm(s.text);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return s.score >= 80 && s.length >= ideal[0] && s.length <= ideal[1];
    })
    .sort((a, b) => b.score - a.score || Math.abs(a.length - mid) - Math.abs(b.length - mid));
}

// "What is MCP" is a question; "When to hire an FDE" and "How to hire" are not.
const isQuestion = (k: string) =>
  /^(what|why|which|who|where)\b/i.test(k.trim()) ||
  /^(how|when)\s+(is|are|do|does|did|can|should|much|many|long|often)\b/i.test(k.trim()) ||
  /^(is|are|should|can|do|does)\b/i.test(k.trim());

/** Up to 3 SEO titles that pass the rules. Each is the field text, before the suffix. */
export function suggestSeoTitles(ctx: SeoContext): Suggestion[] {
  const title = plainText(ctx.title);
  const kw = ctx.focusKeyword.trim();
  const head = kw ? displayKeyword(kw, title) : title.split(/[:(–—|?]/)[0].trim();
  const joiner = isQuestion(head) ? "? " : ": ";
  const maxField = TITLE_RANGE[1] - TITLE_SUFFIX.length;
  const minField = TITLE_RANGE[0] - TITLE_SUFFIX.length;
  const year = new Date().getFullYear();
  const guide = ` (${year} Guide)`;

  const headWords = new Set(words(head));
  const tails = [titleRemainder(title, kw || head), excerptClause(ctx.excerpt), "A Practical Guide", `${year} Guide`, "Explained", "What to Know"]
    .map((t) => t.trim())
    .filter((t) => t.length >= 6)
    // A tail that mostly repeats the keyword adds nothing.
    .filter((t) => words(t).filter((w) => !headWords.has(w)).length >= 1)
    .map(upperFirst);

  const candidates: string[] = [];
  const room = maxField - head.length - joiner.length;
  for (const tail of tails) {
    if (room < 6) break;
    const fitted = clipClause(tail, room);
    if (!fitted || fitted.length < 6) continue;
    let text = `${head}${joiner}${fitted}`;
    const hasGuide = /\bguide\b|\b\d{4}\b/i.test(text);
    if (text.length < minField && !hasGuide && text.length + guide.length <= maxField) text += guide;
    candidates.push(text);
  }
  if (head.length + guide.length <= maxField) candidates.push(`${head}${guide}`);
  if (head.length <= maxField) candidates.push(head);

  const scored = candidates.map((text) => {
    const result = scoreSeoTitle(text, ctx);
    return { text, length: text.length + TITLE_SUFFIX.length, score: result.score, passes: result.rules.filter((r) => r.passed).map((r) => r.id) };
  });
  return rank(scored, TITLE_RANGE).slice(0, 3);
}

/** "what is an ai pod" -> "what an AI pod is", for "Learn …" lead-ins. */
function asLearnObject(keyword: string): string | null {
  const k = keyword.trim();
  const whatIs = k.match(/^(what|who|which)\s+(is|are)\s+(.+)$/i);
  if (whatIs) return `${whatIs[1].toLowerCase()} ${whatIs[3]} ${whatIs[2].toLowerCase()}`;
  if (/^(how|when|why|where|which|what)\b/i.test(k)) return lowerFirst(k);
  return null;
}

const CTA_ENDINGS = [
  "Learn what it takes and how to decide.",
  "See how it works in practice.",
  "Get the trade-offs before you commit budget.",
];

/** Up to 3 meta descriptions that pass the rules. */
export function suggestMetaDescriptions(ctx: SeoContext): Suggestion[] {
  const kw = ctx.focusKeyword.trim();
  const title = plainText(ctx.title);
  const kwDisplay = kw ? displayKeyword(kw, title) : "";
  // Sentences that lean on the one before ("That is…", "So…") make no sense alone.
  const standalone = (s: string) => !/^(that|this|these|those|it|so|but|and|or|then|here|there|also)\b/i.test(s);
  const pool = [...sentences(ctx.excerpt), ...sentences(ctx.bodyText ?? "")].filter(standalone).slice(0, 8);
  if (!pool.length && title) pool.push(endSentence(title));
  const [min, max] = DESCRIPTION_RANGE;

  /** Grow from the pool to reach the range: the lead may end at a clause, additions are whole sentences. */
  const fill = (lead: string, from: number, ending = ""): string | null => {
    const reserve = ending ? ending.length + 1 : 0;
    const first = clipClause(lead, max - reserve - 1);
    if (!first) return null;
    let text = endSentence(first);
    for (let i = from; i < pool.length && text.length + reserve < min; i++) {
      if (text.length + reserve + 1 + pool[i].length <= max) text = `${text} ${pool[i]}`;
    }
    return ending ? `${text} ${ending}` : text;
  };

  const learn = kw ? asLearnObject(kw) : null;
  const leads: Array<[string, number]> = [];
  pool.slice(0, 4).forEach((sentence, i) => {
    const hasKw = !kw || keywordIndex(sentence, kw) >= 0;
    if (hasKw) {
      leads.push([sentence, i + 1]);
      return;
    }
    leads.push([`${kwDisplay}${isQuestion(kwDisplay) ? "?" : ":"} ${isQuestion(kwDisplay) ? sentence : lowerFirst(sentence)}`, i + 1]);
    if (learn) leads.push([`Learn ${learn}: ${lowerFirst(sentence)}`, i + 1]);
  });

  const candidates: string[] = [];
  for (const [lead, next] of leads) {
    if (CTA_RE.test(lead)) candidates.push(fill(lead, next) ?? "");
    for (const ending of CTA_ENDINGS) candidates.push(fill(lead, next, ending) ?? "");
  }

  const scored = candidates.filter(Boolean).map((text) => {
    const result = scoreMetaDescription(text, ctx);
    return { text, length: text.length, score: result.score, passes: result.rules.filter((r) => r.passed).map((r) => r.id) };
  });
  return rank(scored, DESCRIPTION_RANGE)
    .filter((s) => !kw || keywordIndex(s.text, kw) >= 0)
    .slice(0, 3);
}
