import { useState, useEffect, useCallback, useRef } from 'react';
import type { VisibilityState } from '@tanstack/react-table';
import localforage from 'localforage';

// What we actually save: layout + which columns have search/sort toggled ON.
export interface PersistedTableState {
  columnOrder?:       string[];
  columnVisibility?:  VisibilityState;
  columnsWithSearch?: string[];
  columnsWithSort?:   string[];
}

export interface UseTablePersistenceReturn {
  isLoaded:                   boolean;
  persistedColumnOrder:       string[]        | undefined;
  persistedColumnVisibility:  VisibilityState | undefined;
  persistedColumnsWithSearch: Set<string>;
  persistedColumnsWithSort:   Set<string>;
  saveState: (patch: Partial<PersistedTableState>) => void;
}

// In-memory cache — prevents a flash of wrong layout on remount
const stateCache = new Map<string, PersistedTableState>();

const DEFAULT_STATE: PersistedTableState = {
  columnOrder:       undefined,
  columnVisibility:  undefined,
  columnsWithSearch: [],
  columnsWithSort:   [],
};

/**
 * Persists and restores table state (order, visibility, sort config, search toggles)
 * using IndexedDB via localforage. Typed filter values are never saved.
 */
export function useTablePersistence(
  persistenceKey: string | null | undefined,
): UseTablePersistenceReturn {
  const storageKey = persistenceKey ? `datatable:${persistenceKey}` : null;

  const cachedState  = storageKey ? stateCache.get(storageKey) : null;
  const initialState = cachedState ?? DEFAULT_STATE;

  const stateRef = useRef<PersistedTableState>(initialState);

  const [persistedState, setPersistedState] = useState(() => ({
    columnOrder:       initialState.columnOrder,
    columnVisibility:  initialState.columnVisibility,
    columnsWithSearch: new Set<string>(initialState.columnsWithSearch),
    columnsWithSort:   new Set<string>(initialState.columnsWithSort),
    isLoaded:          !storageKey || !!cachedState,
  }));

  // Load from IndexedDB on mount
  useEffect(() => {
    if (!storageKey) return;
    let alive = true;

    localforage.getItem<PersistedTableState>(storageKey).then(saved => {
      if (!alive) return;
      if (saved) {
        stateRef.current = saved;
        stateCache.set(storageKey, saved);
        setPersistedState({
          columnOrder:       saved.columnOrder,
          columnVisibility:  saved.columnVisibility,
          columnsWithSearch: new Set(saved.columnsWithSearch),
          columnsWithSort:   new Set(saved.columnsWithSort),
          isLoaded:          true,
        });
      } else {
        setPersistedState(prev => ({ ...prev, isLoaded: true }));
      }
    }).catch(err => {
      console.error('[useTablePersistence] load failed:', err);
      if (alive) setPersistedState(prev => ({ ...prev, isLoaded: true }));
    });

    return () => { alive = false; };
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge a partial update and write to IndexedDB (skipped if nothing changed)
  const saveState = useCallback((patch: Partial<PersistedTableState>) => {
    if (!storageKey || !persistedState.isLoaded) return;

    const newState = { ...stateRef.current, ...patch };

    const changed = Object.keys(patch).some(k => {
      const key = k as keyof PersistedTableState;
      return JSON.stringify(stateRef.current[key]) !== JSON.stringify(patch[key]);
    });
    if (!changed) return;

    stateRef.current = newState;
    stateCache.set(storageKey, newState);

    // Build only the changed slices for the React state update
    const updates: Partial<typeof persistedState> = {};
    if (patch.columnOrder      !== undefined) updates.columnOrder      = patch.columnOrder;
    if (patch.columnVisibility !== undefined) updates.columnVisibility = patch.columnVisibility;
    if (patch.columnsWithSearch !== undefined) updates.columnsWithSearch = new Set(patch.columnsWithSearch);
    if (patch.columnsWithSort   !== undefined) updates.columnsWithSort   = new Set(patch.columnsWithSort);

    if (Object.keys(updates).length > 0) {
      setPersistedState(prev => ({ ...prev, ...updates }));
    }

    localforage.setItem(storageKey, newState).catch(err => {
      console.error('[useTablePersistence] save failed:', err);
    });
  }, [storageKey, persistedState.isLoaded]);

  return {
    isLoaded:                  persistedState.isLoaded,
    persistedColumnOrder:      persistedState.columnOrder,
    persistedColumnVisibility: persistedState.columnVisibility,
    persistedColumnsWithSearch: persistedState.columnsWithSearch,
    persistedColumnsWithSort:   persistedState.columnsWithSort,
    saveState,
  };
}