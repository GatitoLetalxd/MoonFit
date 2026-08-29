import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export function useAuthenticatedImage(imageUrl?: string): { src: string | null; loading: boolean; error: boolean } {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) {
      setSrc(null);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;
    setLoading(true);
    setError(false);

    apiClient
      .get(imageUrl, { responseType: 'blob' })
      .then((res) => {
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl]);

  return { src, loading, error };
}
