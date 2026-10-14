import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import SEO from './SEO';
import NotFoundView from './NotFoundView';
import BlogCard from './blog/BlogCard';
import CategoryFilterBar from './blog/CategoryFilterBar';
import { buildCategorySchema } from './blog/blogSchema';
import { CATEGORY_PAGE_SIZE, categoryPath, getCategory } from '../data/blogCategories';
import {
  getAllPosts,
  getCategoriesWithCounts,
  getPostsByCategory,
  INSIGHTS_PATH,
} from '../data/blogCatalog';

/**
 * Category page at /insights/category/:slug (and /page/:page beyond the first).
 *
 * Prerendered like every other route, so the heading, the intro and the post
 * links are in the served HTML before any JavaScript runs. An unknown slug or
 * a page number past the end renders the 404 view rather than an empty list.
 */
export default function CategoryView() {
  const { slug, page: pageParam } = useParams<{ slug: string; page?: string }>();
  const category = slug ? getCategory(slug) : undefined;

  const posts = getAllPosts();
  const inCategory = category ? getPostsByCategory(category.slug, posts) : [];
  const pageCount = Math.max(1, Math.ceil(inCategory.length / CATEGORY_PAGE_SIZE));
  const page = pageParam ? Number(pageParam) : 1;

  const outOfRange = !Number.isInteger(page) || page < 1 || page > pageCount;
  // An unknown slug is a 404. A known category with nothing in it yet is a
  // real, indexable page: it is part of the published taxonomy and shows an
  // empty-state panel until its first post lands.
  if (!category || outOfRange) return <NotFoundView />;
  const isEmpty = inCategory.length === 0;

  const visible = inCategory.slice((page - 1) * CATEGORY_PAGE_SIZE, page * CATEGORY_PAGE_SIZE);
  const pageSuffix = page > 1 ? ` — Page ${page}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-10 text-[#0A0A0A]"
    >
      <SEO
        title={`${category.seoTitle}${pageSuffix}`}
        description={category.metaDescription}
        jsonLd={buildCategorySchema(category, visible, page)}
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
          <li className="text-zinc-500" aria-current="page">
            {category.name}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-mono text-[#0066FF] uppercase tracking-widest font-semibold block">
            Category
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">{category.description}</p>
        </div>

        <div className="md:shrink-0 md:pb-1">
          <CategoryFilterBar
            categories={getCategoriesWithCounts(posts)}
            activeSlug={category.slug}
            totalCount={posts.length}
          />
        </div>
      </header>

      <section aria-labelledby="category-articles-heading" className="space-y-8">
        <div className="flex items-end justify-between gap-6">
          <h2
            id="category-articles-heading"
            className="text-[10px] font-mono uppercase tracking-widest text-[#555555] font-semibold"
          >
            Articles
          </h2>
          <span className="text-[10px] font-mono text-zinc-400">
            {inCategory.length} {inCategory.length === 1 ? 'article' : 'articles'}
            {pageCount > 1 ? ` // page ${page} of ${pageCount}` : ''}
          </span>
        </div>

        {isEmpty ? (
          <div className="border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 p-12 md:p-16 text-center space-y-4">
            <p className="text-sm text-[#555555]">
              No articles in this category yet.
            </p>
            <Link
              to={INSIGHTS_PATH}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066FF] hover:underline"
            >
              Read everything in Insights
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {visible.map(post => (
              <div key={post.id} className="h-full">
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 && (
            <PageLink to={categoryPath(category.slug, page - 1)} label="Previous" />
          )}
          {/* key sits on the wrapper: @types/react is not installed, so JSX
              types here do not accept key on a custom component. */}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
            <span key={n}>
              <PageLink to={categoryPath(category.slug, n)} label={String(n)} active={n === page} />
            </span>
          ))}
          {page < pageCount && (
            <PageLink to={categoryPath(category.slug, page + 1)} label="Next" />
          )}
        </nav>
      )}

      <div>
        <Link
          to={INSIGHTS_PATH}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black font-semibold transition-colors"
        >
          <span aria-hidden="true">←</span>
          <span>All insights</span>
        </Link>
      </div>
    </motion.div>
  );
}

function PageLink({ to, label, active = false }: { to: string; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-w-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066FF] ${
        active
          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
          : 'border-zinc-200 bg-white text-[#555555] hover:border-[#0066FF] hover:text-[#0A0A0A]'
      }`}
    >
      {label}
    </Link>
  );
}
