import { useEffect, useMemo, useState } from "react";
import { subscribeBlogs } from "@admin/services/blogs";
import type { BlogDoc, BlogStatus } from "@admin/types/blog";

/**
 * Realtime list of all blogs plus derived status counts. Scheduled posts are
 * never rewritten to "published": they go public when their time passes,
 * because that is what the database's read policy checks.
 */
export function useBlogs() {
  const [blogs, setBlogs] = useState<BlogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeBlogs(
      (data) => {
        setBlogs(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const counts = useMemo(() => {
    const c: Record<BlogStatus, number> = { draft: 0, scheduled: 0, published: 0, archived: 0 };
    for (const b of blogs) c[b.status] = (c[b.status] ?? 0) + 1;
    return { total: blogs.length, ...c };
  }, [blogs]);

  return { blogs, counts, loading, error };
}
