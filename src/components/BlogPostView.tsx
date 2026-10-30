import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from './SEO';
import { trackCtaClick } from '../utils/analytics';
import NotFoundView from './NotFoundView';
import BlogImage from './blog/BlogImage';
import BlogCard from './blog/BlogCard';
import renderMarkdown from './blog/markdown';
import { buildArticleSchema } from './blog/blogSchema';
import {
  absoluteImageUrl,
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
  INSIGHTS_PATH,
  type BlogPost,
} from '../data/blogCatalog';
import { categoryPath } from '../data/blogCategories';

/**
 * Article page at /insights/:slug.
 *
 * The body is the markdown from the post's .md file, rendered by the shared
 * renderer (headings, lists, tables, links). Placeholder cards have no body,
 * so they render a short notice instead — routing, metadata and schema are
 * already in place for when a real article arrives.
 */
export default function BlogPostView() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <NotFoundView />;

  // Hand-picked series posts first (CMS), then the same category: "more of
  // what you were reading", not just "more".
  const picked = (post.relatedSlugs ?? [])
    .map(relatedSlug => getPostBySlug(relatedSlug))
    .filter((other): other is BlogPost => Boolean(other) && other!.id !== post.id);
  const related = [
    ...picked,
    ...getPostsByCategory(post.categorySlug, getAllPosts()).filter(
      other => other.id !== post.id && !picked.includes(other)
    ),
  ].slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-3xl mx-auto space-y-8 text-[#0A0A0A]"
    >
      <SEO
        title={`${post.seoTitle ?? post.title} | Fwdpod`}
        description={post.excerpt}
        ogType="article"
        articlePublishedTime={post.isoDate}
        articleModifiedTime={post.modifiedIsoDate}
        ogImage={post.image ? absoluteImageUrl(post.image) : undefined}
        jsonLd={buildArticleSchema(post)}
      />

      <nav aria-label="Breadcrumb" className="text-[10px] font-mono text-zinc-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-[#0066FF] transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={INSIGHTS_PATH} className="hover:text-[#0066FF] transition-colors">
              Insights
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to={categoryPath(post.categorySlug)}
              className="hover:text-[#0066FF] transition-colors"
            >
              {post.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-zinc-500 line-clamp-1" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <article className="space-y-8">
        <header className="space-y-4">
          <Link
            to={categoryPath(post.categorySlug)}
            className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] bg-[#0066FF]/5 hover:bg-[#0066FF]/10 px-2.5 py-0.5 rounded-full font-semibold inline-block transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066FF]"
          >
            {post.category}
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-sm text-[#555555] leading-relaxed">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 pt-1">
            <span>{post.author}</span>
            {post.isoDate ? <time dateTime={post.isoDate}>{post.date}</time> : <span>{post.date}</span>}
            {post.readTime ? <span>{post.readTime}</span> : null}
          </div>
        </header>

        {post.image && (
          <BlogImage post={post} aspect="aspect-[16/9]" priority className="rounded-3xl" />
        )}

        {post.content ? (
          <div className="prose prose-zinc max-w-none text-zinc-800 font-serif text-[15px] sm:text-[16px] leading-relaxed space-y-6 pt-4 border-t border-zinc-100">
            {renderMarkdown(post.content)}
          </div>
        ) : (
          <div className="border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 p-12 text-center">
            <p className="text-xs text-zinc-400 font-mono">
              This article has not been written yet.
            </p>
          </div>
        )}
      </article>

      <section
        aria-labelledby="article-cta-heading"
        className="border border-zinc-200/85 rounded-3xl bg-zinc-50/60 p-8 md:p-10 space-y-3"
      >
        <h2 id="article-cta-heading" className="text-xl md:text-2xl font-display font-medium tracking-tight">
          Planning an AI deployment?
        </h2>
        <p className="text-sm text-[#555555] leading-relaxed max-w-xl">
          Fwdpod places pre-vetted AI engineers from India inside your team, as one
          specialist or a full AI pod. Book a call about your roadmap, or browse the pods
          we deploy most.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            to="/configure"
            onClick={() => trackCtaClick('Book a 30-minute call (article)', '/configure')}
            className="inline-flex items-center gap-1.5 bg-[#0A0A0A] hover:bg-[#0066FF] text-white text-xs font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Book a 30-minute call
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            to="/our-solutions"
            className="inline-flex items-center gap-1.5 border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A]/5 text-xs font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Browse our solutions
          </Link>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="space-y-6 pt-2">
          <div className="flex items-end justify-between gap-6">
            <h2
              id="related-heading"
              className="text-[10px] font-mono uppercase tracking-widest text-[#555555] font-semibold"
            >
              More in {post.category}
            </h2>
            <Link
              to={categoryPath(post.categorySlug)}
              className="text-[10px] font-mono text-[#0066FF] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {related.map(other => (
              <div key={other.id} className="h-full">
                <BlogCard post={other} />
              </div>
            ))}
          </div>
        </section>
      )}

      <Link
        to={INSIGHTS_PATH}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black font-semibold transition-colors pt-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all insights</span>
      </Link>
    </motion.div>
  );
}
