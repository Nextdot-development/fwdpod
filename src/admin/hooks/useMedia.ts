import { useEffect, useState } from "react";
import { subscribeMedia } from "@admin/services/media";
import type { MediaItem } from "@admin/types/media";

/** Realtime media library with loading + error state. */
export function useMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeMedia(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { items, loading, error };
}
