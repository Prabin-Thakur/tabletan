import { useMemo } from 'react';
import { DataTableColumnDef } from '../utils/types';

interface UseTableSkeletonProps<T> {
  columns: DataTableColumnDef<T, unknown>[];
  rowCount?: number;
  estimateRowHeight?: number;
}

/** Returns an array of animated placeholder rows to show while data is loading. */
export function useTableSkeleton<T>({
  columns,
  rowCount          = 10,
  estimateRowHeight = 48,
}: UseTableSkeletonProps<T>) {
  return useMemo(() =>
    Array.from({ length: rowCount }).map((_, rowIdx) => (
      <tr
        key={`skeleton-${rowIdx}`}
        className="animate-pulse border-b border-gray-100 dark:border-gray-800 flex items-center w-full"
        style={{ height: estimateRowHeight }}
      >
        {columns.map((col, colIdx) => {
          const size = col.size ?? 150;
          // grow is a top-level DataTableColumnDef field
          const grow = (col as DataTableColumnDef<T>).grow ?? false;
          return (
            <td
              key={`skeleton-col-${colIdx}`}
              className="px-4 py-3 flex shrink-0 items-center bg-white dark:bg-gray-900"
              style={{ width: size, minWidth: size, flexGrow: grow ? 1 : 0 }}
            >
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            </td>
          );
        })}
      </tr>
    )),
  [columns, rowCount, estimateRowHeight]);
}
