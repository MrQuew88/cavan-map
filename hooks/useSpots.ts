'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Spot } from '@/lib/types';

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpots = useCallback(async () => {
    try {
      const res = await fetch('/api/spots');
      if (!res.ok) throw new Error('Failed to fetch spots');
      const data = await res.json();
      setSpots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const createSpot = useCallback(async (spot: Spot) => {
    setSpots((prev) => [...prev, spot]);

    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spot),
      });

      if (!res.ok) {
        setSpots((prev) => prev.filter((s) => s.id !== spot.id));
        throw new Error('Failed to create spot');
      }

      const created = await res.json();
      setSpots((prev) => prev.map((s) => (s.id === spot.id ? created : s)));
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateSpot = useCallback(async (id: string, updates: Partial<Spot>) => {
    const prev = spots;
    setSpots((current) =>
      current.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    try {
      const res = await fetch(`/api/spots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        setSpots(prev);
        throw new Error('Failed to update spot');
      }

      const updated = await res.json();
      setSpots((current) => current.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [spots]);

  const deleteSpot = useCallback(async (id: string) => {
    const prev = spots;
    setSpots((current) => current.filter((s) => s.id !== id));

    try {
      const res = await fetch(`/api/spots/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setSpots(prev);
        throw new Error('Failed to delete spot');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [spots]);

  return {
    spots,
    loading,
    error,
    createSpot,
    updateSpot,
    deleteSpot,
    refetch: fetchSpots,
  };
}
