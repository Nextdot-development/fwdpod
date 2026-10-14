import { Link } from 'react-router-dom';
import type { BlogPost } from '../../data/blogCatalog';
import { postPath } from '../../data/blogCatalog';
import BlogImage from './BlogImage';

/**
 * The lead article: content left, image right on wide screens, stacked below
 * xl. Mark a post with `featured: true` in its frontmatter to put it here;
 * otherwise the newest post takes the slot.
 *
 * Every featured post gets the same card, whatever its title length, so the
 * image always fills its half. Below xl the card stacks and the image sits on
 * top at its own 16:9. From xl it is a 50/50 split whose height is set by the
 * image's 16:9; the text is kept inside that (title clamped to three lines,
 * excerpt to two, slightly tighter spacing), and if it ever outgrew it the
 * image would cover the extra height rather than leave a band.
 */
export default function FeaturedBlog({ post }: { post: BlogPost }) {
  return (
    <section aria-labelledby="featured-heading" className="space-y-4">
      <h2
        id="featured-heading"
        className="text-[10px] font-mono uppercase tracking-widest text-[#555555] font-semibold"
      >
        Featured article
      </h2>

      <article>
        <Link
          to={postPath(post)}
          className="group grid grid-cols-1 xl:grid-cols-2 gap-0 bg-white border border-zinc-200/85 rounded-3xl overflow-hidden shadow-sm hover:border-[#0066FF] hover:shadow-md transition-all duration-300 ease-out"
        >
          <div className="flex flex-col justify-center gap-4 xl:gap-3 p-8 md:p-10 xl:p-8 order-2 xl:order-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] bg-[#0066FF]/5 px-2.5 py-0.5 rounded-full font-semibold self-start">
              {post.category}
            </span>

            <h3 className="text-2xl md:text-3xl font-display font-medium text-[#0A0A0A] leading-tight tracking-tight xl:line-clamp-3 group-hover:text-[#0066FF] transition-colors">
              {post.title}
            </h3>

            <p className="text-sm text-[#555555] leading-relaxed line-clamp-3 xl:line-clamp-2 max-w-xl">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 pt-1">
              <span>{post.date}</span>
              {post.readTime ? <span>{post.readTime}</span> : null}
            </div>

            <span className="text-xs font-semibold text-[#0066FF] flex items-center gap-1.5 pt-1">
              Read article
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>

          <div className="order-1 xl:order-2 relative">
            {/* In-flow 16:9 so the image's height counts towards the row, while
                the column itself still stretches when the text is taller. An
                aspect-ratio on the column would stop it stretching. */}
            <div aria-hidden="true" className="hidden xl:block aspect-[16/9]" />
            <BlogImage
              post={post}
              aspect="aspect-[16/9] xl:aspect-auto xl:absolute xl:inset-0 xl:h-full"
              priority
              className="xl:object-cover"
            />
          </div>
        </Link>
      </article>
    </section>
  );
}
