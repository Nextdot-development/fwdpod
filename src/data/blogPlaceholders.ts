/**
 * Stand-in cards for the blog listing, shown ONLY while content/blog/ has no
 * articles. Adding a single .md file replaces all of them automatically
 * (see getAllPosts in blogCatalog.ts), so there is nothing to delete later.
 *
 * They deliberately carry no real claims, no images and no body text.
 */
import type { BlogPost } from './blogCatalog';
import { BLOG_CATEGORIES } from './blogCategories';

export const PLACEHOLDER_POSTS: BlogPost[] = Array.from({ length: 14 }, (_, i) => {
  const n = i + 1;
  return {
    id: `placeholder-${n}`,
    title: `Blog title placeholder ${n}`,
    slug: `placeholder-${n}`,
    category: BLOG_CATEGORIES[i % BLOG_CATEGORIES.length].name,
    categorySlug: BLOG_CATEGORIES[i % BLOG_CATEGORIES.length].slug,
    excerpt:
      'Short blog description placeholder. Two lines of summary copy sit here so the card height and text clamping can be checked before the real articles arrive.',
    content: '',
    date: 'Placeholder date',
    readTime: '0 min read',
    author: 'Fwdpod',
    featured: n === 1,
    placeholder: true,
  };
});
