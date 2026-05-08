import React, { useEffect, useRef } from 'react';
import { Table as TableType, Row } from '@tanstack/react-table';
import { VirtualItem } from '@tanstack/react-virtual';
import { TableRow } from './TableRow';
import { Loader2 } from './icons';

interface TableBodyProps<T> {
  table: TableType<T>;
  virtualizer?: any;
  isLoading?: boolean;
  isFetching?: boolean;
  stickyLeft?: string[];
  stickyRight?: string[];
  getStickyStyle: (columnId: string) => React.CSSProperties;
  className?: string;
  rowClassName?: string | ((row: Row<T>) => string);
  cellClassName?: string | ((cell: any) => string);
  onRowClick?: (row: Row<T>) => void;
  onRowDoubleClick?: (row: Row<T>) => void;
  emptyState?: React.ReactNode;
  mode?: 'client' | 'server' | 'infinite';
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactNode;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
}

export const TableBody = <T,>({
  table,
  virtualizer,
  isLoading,
  isFetching,
  stickyLeft,
  stickyRight,
  getStickyStyle,
  className,
  rowClassName,
  cellClassName,
  onRowClick,
  onRowDoubleClick,
  emptyState,
  mode = 'client',
  renderSubComponent,
  onLoadMore,
  hasNextPage,
}: TableBodyProps<T>) => {
  const allRows = table.getRowModel().rows;
  const isVirtualized = !!virtualizer;
  const loaderRef = useRef<HTMLDivElement>(null);

  // Get virtual items
  const virtualItems = isVirtualized ? virtualizer.getVirtualItems() : null;

  // Infinite scroll trigger via IntersectionObserver on the loader row/placeholder
  useEffect(() => {
    if (mode !== 'infinite' || !onLoadMore || !hasNextPage || isFetching || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
            onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
        if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [mode, onLoadMore, hasNextPage, isFetching, isLoading, virtualItems]); 

  // Handle empty state
  if (!isLoading && allRows.length === 0) {
    return (
      <tbody className={className}>
        <tr>
          <td
            colSpan={table.getVisibleLeafColumns().length}
            className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
          >
            {emptyState || 'No data available'}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody
      className={className}
      style={{
        display: 'block',
        height: isVirtualized ? `${virtualizer.getTotalSize()}px` : 'auto',
        position: 'relative',
        width: '100%',
      }}
    >
      {isVirtualized ? (
        virtualItems?.map((virtualItem: VirtualItem) => {
          const isLoaderRow = virtualItem.index >= allRows.length;
          
          if (isLoaderRow) {
            return (
              <div
                key="loader-row"
                ref={loaderRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isFetching && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            );
          }

          const row = allRows[virtualItem.index];
          if (!row) return null;

          return (
            <TableRow
              key={row.id}
              row={row}
              index={virtualItem.index}
              virtualizer={virtualizer}
              stickyLeft={stickyLeft}
              stickyRight={stickyRight}
              getStickyStyle={getStickyStyle}
              rowClassName={rowClassName}
              cellClassName={cellClassName}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
              renderSubComponent={renderSubComponent}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          );
        })
      ) : (
        allRows.map((row, index) => (
          <TableRow
            key={row.id}
            row={row}
            index={index}
            virtualizer={null}
            stickyLeft={stickyLeft}
            stickyRight={stickyRight}
            getStickyStyle={getStickyStyle}
            rowClassName={rowClassName}
            cellClassName={cellClassName}
            onRowClick={onRowClick}
            onRowDoubleClick={onRowDoubleClick}
            renderSubComponent={renderSubComponent}
          />
        ))
      )}

      {/* Non-virtualized Infinite Scroll Sentinel */}
      {!isVirtualized && mode === 'infinite' && hasNextPage && (
        <div
          ref={loaderRef}
          className="flex items-center justify-center h-16 w-full"
        >
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}
    </tbody>
  );
};