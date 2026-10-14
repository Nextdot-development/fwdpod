import { Link } from 'react-router-dom';
import type { BlogPost } from '../../data/blogCatalog';
import { postPath } from '../../data/blogCatalog';
import BlogImage from './BlogImage';

/**
 * One article in the grid: image, category, title, nothing else. The card is
 * a way in, not a summary — the excerpt and the dates live on the article
 * itself, and keeping them off the card keeps the grid short and scannable.
 * The whole card is a single link, so the click target matches what is seen.
 */
export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="h-full">
      <Link
        to={postPath(post)}
        className="group h-full flex flex-col bg-white border border-zinc-200/85 rounded-2xl overflow-hidden shadow-sm hover:border-[#0066FF] hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 ease-out"
      >
        <BlogImage post={post} />

        <div className="flex flex-col flex-1 gap-2 p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] bg-[#0066FF]/5 px-2.5 py-0.5 rounded-full font-semibold self-start">
            {post.category}
          </span>

          <h3 className="text-sm md:text-base font-display font-medium text-[#0A0A0A] leading-snug tracking-tight line-clamp-2 group-hover:text-[#0066FF] transition-colors">
            {post.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
