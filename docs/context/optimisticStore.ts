import { create } from 'zustand';

/**
 * Tracks in-flight optimistic edits keyed by `${table}:${id}`.
 * Pattern:
 *  1. On submit, call setPending(table, id, patch) — UI reads through this
 *     overlay immediately, no waiting on the network.
 *  2. Fire the Supabase mutation.
 *  3. On success: queryClient.invalidateQueries([table]) then clearPending(table, id).
 *  4. On error: clearPending(table, id) to roll back to server truth, show a toast.
 */

type Patch = Record<string, unknown>;

interface OptimisticState {
  pending: Record<string, Patch>;

  setPending: (table: string, id: string, patch: Patch) => void;
  clearPending: (table: string, id: string) => void;
  getPending: (table: string, id: string) => Patch | undefined;
  /** Merge a server row with any pending optimistic patch for display */
  withOptimistic: <T extends Record<string, unknown>>(table: string, row: T) => T;
}

export const useOptimisticStore = create<OptimisticState>()((set, get) => ({
  pending: {},

  setPending: (table, id, patch) =>
    set((s) => ({ pending: { ...s.pending, [`${table}:${id}`]: patch } })),

  clearPending: (table, id) =>
    set((s) => {
      const next = { ...s.pending };
      delete next[`${table}:${id}`];
      return { pending: next };
    }),

  getPending: (table, id) => get().pending[`${table}:${id}`],

  withOptimistic: (table, row) => {
    const id = (row as { id?: string }).id;
    if (!id) return row;
    const patch = get().pending[`${table}:${id}`];
    return patch ? { ...row, ...patch } : row;
  },
}));

// Selector hook for a single row's pending patch (avoids re-rendering the
// whole table when unrelated rows have optimistic edits in flight)
export const usePendingPatch = (table: string, id: string) =>
  useOptimisticStore((s) => s.pending[`${table}:${id}`]);
