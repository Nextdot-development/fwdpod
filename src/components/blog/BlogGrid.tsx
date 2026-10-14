import { useState } from 'react';
import type { BlogPost } from '../../data/blogCatalog';
import BlogCard from './BlogCard';

interface BlogGridProps {
  posts: BlogPost[];
  /** Cards rendered before "Load more"; the first batch is in the server HTML. */
  pageSize?: number;
}

/** Three columns on desktop, two on tablet, one on mobile. */
export default function BlogGrid({ posts, pageSize = 9 }: BlogGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visible = posts.slice(0, visibleCount);
  const remaining = posts.length - visible.length;

  return (
    <section aria-labelledby="all-articles-heading" className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <h2
          id="all-articles-heading"
          className="text-[10px] font-mono uppercase tracking-widest text-[#555555] font-semibold"
        >
          All articles
        </h2>
        {posts.length > 0 && (
          <span className="text-[10px] font-mono text-zinc-400">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </span>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 p-16 text-center">
          <p className="text-xs text-zinc-400 font-mono">No articles published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* The key sits on this wrapper: @types/react is not installed in this
              project, so JSX types here do not accept key on a custom component. */}
          {visible.map(post => (
            <div key={post.id} className="h-full">
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount(count => count + pageSize)}
            className="border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A]/5 text-xs font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Load more articles
          </button>
          <p className="text-[10px] font-mono text-zinc-400">
            Showing {visible.length} of {posts.length}
          </p>
        </div>
      )}
    </section>
  );
}
