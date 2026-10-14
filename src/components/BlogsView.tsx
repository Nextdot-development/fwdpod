import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import FeaturedBlog from './blog/FeaturedBlog';
import BlogGrid from './blog/BlogGrid';
import CategoryFilterBar from './blog/CategoryFilterBar';
import { BLOG_DESCRIPTION, BLOG_TITLE, buildBlogListSchema } from './blog/blogSchema';
import {
  getAllPosts,
  getFeaturedPost,
  getCategoriesWithCounts,
  getListingPosts,
} from '../data/blogCatalog';

/**
 * Blog listing: hero, featured article, article grid, load more, closing CTA.
 * Header, <main> and footer come from App.tsx and are untouched.
 *
 * Cards are driven by the data layer (content/blog/*.md), not written in JSX.
 */
export default function BlogsView() {
  const posts = getAllPosts();
  const featured = getFeaturedPost(posts);
  const listing = getListingPosts(posts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-14 text-[#0A0A0A]"
    >
      <SEO title={BLOG_TITLE} description={BLOG_DESCRIPTION} jsonLd={buildBlogListSchema(posts)} />

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      {/* TODO(copy): eyebrow, H1 and the supporting line are placeholders. */}
      <section className="flex flex-col gap-6 pt-2 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-mono text-[#0066FF] uppercase tracking-widest font-semibold block">
            Knowledge hub
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight">
            Fwdpod Insights
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Notes on building and running AI systems in production, from the engineers who deliver them.
          </p>
        </div>

        <div className="md:shrink-0 md:pb-1">
          <CategoryFilterBar categories={getCategoriesWithCounts(posts)} totalCount={posts.length} />
        </div>
      </section>

      {featured && <FeaturedBlog post={featured} />}

      {/* Hidden while the featured post is the only article: an empty
          "All articles" panel under a visible article reads as a fault. */}
      {listing.length > 0 && <BlogGrid posts={listing} />}

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      {/* TODO(copy): CTA wording is a placeholder. */}
      <section
        aria-labelledby="blog-cta-heading"
        className="bg-zinc-50 border border-zinc-200/85 rounded-3xl p-8 md:p-12 text-center space-y-4"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066FF] font-semibold block">
          Ready when you are
        </span>
        <h2
          id="blog-cta-heading"
          className="text-2xl md:text-3xl font-display font-medium tracking-tight"
        >
          Put a dedicated AI engineering pod on your product.
        </h2>
        <p className="text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
          Answer five questions and a Technical Principal replies with a scoped proposal.
        </p>
        <div className="pt-2">
          <Link
            to="/configure"
            className="inline-block bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-semibold py-3.5 px-8 rounded-full transition-colors"
          >
            Configure your pod
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
