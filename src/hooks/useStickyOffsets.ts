import { Table } from '@tanstack/react-table';
import { useMemo } from 'react';

/**
 * Calculates the pixel `left` / `right` offset for each sticky column.
 * Returns `getStickyStyle(columnId)` — a function you call per cell.
 */
export function useStickyOffsets<T>(
  table: Table<T>,
  leftColumns:  string[] = [],
  rightColumns: string[] = [],
) {
  const offsets = useMemo(() => {
    const left:  Record<string, number> = {};
    const right: Record<string, number> = {};

    // Left offsets: each column starts where the previous one ended
    let x = 0;
    for (const id of leftColumns) {
      const col = table.getColumn(id);
      if (col) { left[id] = x; x += col.getSize(); }
    }

    // Right offsets: mirror — iterate reversed
    x = 0;
    for (const id of [...rightColumns].reverse()) {
      const col = table.getColumn(id);
      if (col) { right[id] = x; x += col.getSize(); }
    }

    return { left, right };
  }, [table, leftColumns, rightColumns, table.getState().columnSizing]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStickyStyle = (columnId: string): React.CSSProperties => {
    const isLeft  = leftColumns.includes(columnId);
    const isRight = rightColumns.includes(columnId);
    if (!isLeft && !isRight) return {};
    return {
      position: 'sticky',
      left:     isLeft  ? `${offsets.left[columnId]}px`  : undefined,
      right:    isRight ? `${offsets.right[columnId]}px` : undefined,
      zIndex:   20, // above normal cells, below sticky header
    };
  };

  return { getStickyStyle };
}