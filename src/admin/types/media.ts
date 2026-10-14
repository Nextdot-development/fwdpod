import type { Timestamp } from "@admin/lib/time";

/** An image in the Supabase `blog-images` bucket, indexed in the `media` table. */
export interface MediaItem {
  id?: string;
  url: string; // public download URL
  path: string; // storage path, e.g. "blog-images/1690000000-hero.jpg"
  name: string; // original file name
  alt: string;
  caption: string;
  size: number; // bytes
  contentType: string;
  width: number; // px (0 if unknown)
  height: number; // px (0 if unknown)
  createdAt: Timestamp | null;
}

export type MediaInput = Omit<MediaItem, "id" | "createdAt">;
