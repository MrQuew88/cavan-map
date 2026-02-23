'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Annotation } from '@/lib/types';

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnotations = useCallback(async () => {
    try {
      const res = await fetch('/api/annotations');
      if (!res.ok) throw new Error('Failed to fetch annotations');
      const data = await res.json();
      setAnnotations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  const createAnnotation = useCallback(async (annotation: Annotation) => {
    // Optimistic update
    setAnnotations((prev) => [...prev, annotation]);

    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation),
      });

      if (!res.ok) {
        // Rollback on failure
        setAnnotations((prev) => prev.filter((a) => a.id !== annotation.id));
        throw new Error('Failed to create annotation');
      }

      const created = await res.json();
      setAnnotations((prev) =>
        prev.map((a) => (a.id === annotation.id ? created : a))
      );
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateAnnotation = useCallback(async (id: string, updates: Partial<Annotation>) => {
    const prev = annotations;
    setAnnotations((current) =>
      current.map((a) => (a.id === id ? { ...a, ...updates } as Annotation : a))
    );

    try {
      const res = await fetch(`/api/annotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        setAnnotations(prev);
        throw new Error('Failed to update annotation');
      }

      const updated = await res.json();
      setAnnotations((current) =>
        current.map((a) => (a.id === id ? updated : a))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [annotations]);

  const deleteAnnotation = useCallback(async (id: string) => {
    const prev = annotations;
    setAnnotations((current) => current.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/annotations/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setAnnotations(prev);
        throw new Error('Failed to delete annotation');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [annotations]);

  return {
    annotations,
    setAnnotations,
    loading,
    error,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    refetch: fetchAnnotations,
  };
}
