import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';

import { DataTableProps, DataTableColumnDef } from './utils/types';
export type { DataTableColumnDef };

import { useTableConfig }      from './hooks/useTableConfig';
import { useStickyOffsets }    from './hooks/useStickyOffsets';
import { useEnhancedColumns }  from './hooks/useEnhancedColumns';
import { useVirtualRows }      from './features/virtualization/useVirtualRows';
import { useTableSkeleton }    from './hooks/useTableSkeleton';
import { useColumnOrder }      from './hooks/useColumnOrder';
import { useTablePersistence } from './hooks/useTablePersistence';

import { TableContainer, Table, TableBodyWrapper } from './ui/Table';
import { TableHeader }  from './ui/TableHeader';
import { TableBody }    from './ui/TableBody';
import { TableFooter }  from './ui/TableFooter';
import { TableToolbar } from './ui/TableToolBar';

export function BaseTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    totalRows,

    mode          = 'client',
    isLoading     = false,
    isFetching    = false,
    isError       = false,
    error         = null,

    // Feature flags
    enablePagination    = false,
    enableFiltering     = false,
    enableSelection     = false,
    enableVirtualization = false,
    enableStickyHeader  = true,
    enableGlobalSearch  = false,
    enableExport        = false,
    enableColumnReordering = false,
    enableExpansion     = false,

    filteringConfig,
    virtualizationConfig,
    toolbarConfig,
    skeletonConfig,

    // Sticky columns
    stickyLeft,
    stickyRight,

    // Column visibility
    columnVisibility,
    onColumnVisibilityChange,
    onColumnOrderChange,

    // Layout
    height,
    maxHeight,

    // Styling
    className,
    containerClassName,
    headerClassName,
    bodyClassName,
    rowClassName,
    cellClassName,

    // Custom content slots
    emptyState,
    loadingState,
    errorState,
    renderSubComponent,

    // Events
    onRowClick,
    onRowDoubleClick,

    // Infinite scroll
    onLoadMore,
    hasNextPage,

    // Persistence
    persistenceKey,

    // a11y
    'aria-label'    : ariaLabel,
    'aria-labelledby': ariaLabelledby,
  } = props;

  // ── Columns ───────────────────────────────────────────────────────────────
  // Adds extra columns (expander, selection)
  const tableColumns = useEnhancedColumns({
    columns,
    enableRowSelection: enableSelection,
    enableExpansion: enableExpansion || !!renderSubComponent,
  });

  // ── Persistence ───────────────────────────────────────────────────────────
  // Reads/writes column order, visibility, sorting & filters from IndexedDB
  const {
    isLoaded: persistenceLoaded,
    persistedColumnOrder,
    persistedColumnVisibility,
    persistedColumnsWithSearch,
    persistedColumnsWithSort,
    saveState,
  } = useTablePersistence(persistenceKey);

  // ── Column visibility ─────────────────────────────────────────────────────
  // If the caller doesn't pass columnVisibility we own it internally
  const isVisibilityControlled = columnVisibility !== undefined;
  const [internalVisibility, setInternalVisibility] = useState(
    persistedColumnVisibility ?? {},
  );
  const activeVisibility = isVisibilityControlled ? columnVisibility : internalVisibility;

  // Re-hydrate from IndexedDB once it finishes loading
  useEffect(() => {
    if (persistenceLoaded && persistedColumnVisibility !== undefined) {
      setInternalVisibility(persistedColumnVisibility);
      if (isVisibilityControlled) onColumnVisibilityChange?.(persistedColumnVisibility);
    }
  }, [persistenceLoaded]);

  // Called by TanStack Table whenever a column is toggled
  const handleVisibilityChange = useCallback((updater: unknown) => {
    const next = typeof updater === 'function'
      ? (updater as (prev: typeof activeVisibility) => typeof activeVisibility)(activeVisibility)
      : updater as typeof activeVisibility;
    if (isVisibilityControlled) {
      onColumnVisibilityChange?.(next);
    } else {
      setInternalVisibility(next);
    }
    saveState({ columnVisibility: next });
  }, [activeVisibility, isVisibilityControlled, onColumnVisibilityChange, saveState]);

  // ── Column reordering ─────────────────────────────────────────────────────
  // Sticky + explicitly locked columns can't be dragged
  const lockedIds = useMemo(() => {
    const sticky = [...(stickyLeft ?? []), ...(stickyRight ?? [])];
    const explicit = tableColumns
      .map(col => {
        const id = col.id ?? (col as { accessorKey?: string }).accessorKey;
        return (col as DataTableColumnDef<T>).enableDragging === false && typeof id === 'string' ? id : null;
      })
      .filter((id): id is string => id !== null);
    return Array.from(new Set([...sticky, ...explicit]));
  }, [stickyLeft, stickyRight, tableColumns]);

  const draggableIds = useMemo(() => {
    if (!enableColumnReordering) return [];
    return tableColumns
      .map(c => (c as DataTableColumnDef<T>).id ?? (c as { accessorKey?: string }).accessorKey)
      .filter((id): id is string => typeof id === 'string' && !lockedIds.includes(id));
  }, [tableColumns, enableColumnReordering, lockedIds]);

  const defaultOrder = useMemo(
    () => tableColumns
      .map(c => c.id ?? (c as { accessorKey?: string }).accessorKey)
      .filter((id): id is string => typeof id === 'string'),
    [tableColumns],
  );

  const { columnOrder, handleDragEnd } = useColumnOrder({
    initialOrder: persistedColumnOrder ?? defaultOrder,
    lockedIds,
    onOrderChange: (newOrder) => {
      saveState({ columnOrder: newOrder });
      onColumnOrderChange?.(newOrder);
    },
  });

  // Expand group-column order into leaf column ids for TanStack Table
  const derivedColumnOrder = useMemo(() => {
    if (!enableColumnReordering) return undefined;
    const result: string[] = [];
    columnOrder.forEach((id: string) => {
      const colDef = tableColumns.find(
        c => c.id === id || (c as { accessorKey?: string }).accessorKey === id,
      );
      if (colDef) {
        const getLeafIds = (def: DataTableColumnDef<T>): string[] => {
          if ('columns' in def && Array.isArray((def as { columns?: unknown[] }).columns)) {
            return ((def as { columns: DataTableColumnDef<T>[] }).columns).flatMap(getLeafIds);
          }
          const leaf = def.id ?? (def as { accessorKey?: string }).accessorKey;
          return typeof leaf === 'string' ? [leaf] : [];
        };
        result.push(...getLeafIds(colDef as DataTableColumnDef<T>));
      } else {
        result.push(id);
      }
    });
    return result;
  }, [columnOrder, tableColumns, enableColumnReordering]);

  // ── DnD sensors ───────────────────────────────────────────────────────────
  // Require 8px movement before drag starts so normal clicks (sort/resize) still work
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEndWrapped = useCallback(
    (event: Parameters<typeof handleDragEnd>[0]) => {
      setActiveDragId(null);
      handleDragEnd(event);
    },
    [handleDragEnd],
  );

  // ── Table instance ────────────────────────────────────────────────────────
  const table = useTableConfig({
    ...props,
    columns: tableColumns,
    columnVisibility: activeVisibility,
    onColumnVisibilityChange: handleVisibilityChange,
    ...(enableColumnReordering ? { columnOrder: derivedColumnOrder } : {}),
  });

  // ── Per-column search / sort toggles ─────────────────────────────────────
  const [columnsWithSearch, setColumnsWithSearch] = useState<Set<string>>(persistedColumnsWithSearch);
  const [columnsWithSort,   setColumnsWithSort]   = useState<Set<string>>(persistedColumnsWithSort);

  useEffect(() => {
    if (!persistenceLoaded) return;
    setColumnsWithSearch(new Set(persistedColumnsWithSearch));
    setColumnsWithSort(new Set(persistedColumnsWithSort));
  }, [persistenceLoaded]);

  const handleToggleColumnSearch = useCallback((colId: string) => {
    setColumnsWithSearch(prev => {
      const next = new Set(prev);
      if (next.has(colId)) { next.delete(colId); table.getColumn(colId)?.setFilterValue(undefined); }
      else next.add(colId);
      saveState({ columnsWithSearch: Array.from(next) });
      return next;
    });
  }, [table, saveState]);

  const handleToggleColumnSort = useCallback((colId: string) => {
    setColumnsWithSort(prev => {
      const next = new Set(prev);
      if (next.has(colId)) {
        next.delete(colId);
        table.setSorting(table.getState().sorting.filter(s => s.id !== colId));
      } else {
        next.add(colId);
      }
      saveState({ columnsWithSort: Array.from(next) });
      return next;
    });
  }, [table, saveState]);

  const handleClearSearch = useCallback(() => {
    table.resetColumnFilters();
    table.resetGlobalFilter();
  }, [table]);

  const handleClearAll = useCallback(() => {
    table.resetColumnFilters();
    table.resetGlobalFilter();
    table.resetSorting();
    setColumnsWithSearch(new Set());
    setColumnsWithSort(new Set());
    saveState({ columnsWithSearch: [], columnsWithSort: [] });
  }, [table, saveState]);

  // ── Virtualization ────────────────────────────────────────────────────────
  const bodyRef = useRef<HTMLDivElement>(null);
  const rows    = table.getRowModel().rows;

  const estimateRowHeight = virtualizationConfig?.estimateRowHeight ?? 48;
  const overscan          = virtualizationConfig?.overscan ?? 5;

  // useVirtualRows must not be called conditionally, so we always call it
  // and just don't use the result when virtualization is off
  const rowVirtualizer = useVirtualRows({
    parentRef:    enableVirtualization ? bodyRef : { current: null },
    rowCount:     mode === 'infinite' && hasNextPage ? rows.length + 1 : rows.length,
    estimateSize: estimateRowHeight,
    overscan,
  });

  const virtualizer = enableVirtualization ? rowVirtualizer : null;

  // ── Layout ────────────────────────────────────────────────────────────────
  const containerMaxHeight = maxHeight || (enableVirtualization ? '600px' : undefined);

  // ── Loading / error states ────────────────────────────────────────────────
  // Full skeleton while first page loads (or refetching in non-infinite modes)
  const showFullSkeleton   = isLoading || (isFetching && mode !== 'infinite');
  // Show inline spinner row at the bottom for infinite scroll
  const showInlineSkeleton = isLoading && mode === 'infinite' && data.length > 0;

  const skeletonRows = useTableSkeleton<T>({
    columns:           tableColumns,
    rowCount:          skeletonConfig?.rowCount ?? 10,
    estimateRowHeight,
  });

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderBody = () => {
    // Error state
    if (isError || error) {
      if (errorState) {
        return (
          <tbody>
            <tr>
              <td colSpan={table.getVisibleLeafColumns().length}>
                {errorState}
              </td>
            </tr>
          </tbody>
        );
      }
      return (
        <tbody>
          <tr>
            <td colSpan={table.getVisibleLeafColumns().length} className="p-0">
              <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                <p className="font-semibold text-red-600 dark:text-red-400">Failed to load data</p>
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {error?.message || 'Please try again later'}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    // Loading skeleton
    if (showFullSkeleton) {
      if (loadingState) {
        return (
          <tbody>
            <tr>
              <td colSpan={table.getVisibleLeafColumns().length}>
                {loadingState}
              </td>
            </tr>
          </tbody>
        );
      }
      return <tbody>{skeletonRows}</tbody>;
    }

    // Normal data rows
    return (
      <TableBody<T>
        table={table}
        virtualizer={virtualizer}
        isFetching={isFetching}
        isLoading={showInlineSkeleton}
        stickyLeft={stickyLeft}
        stickyRight={stickyRight}
        getStickyStyle={getStickyStyle}
        className={bodyClassName}
        rowClassName={rowClassName}
        cellClassName={cellClassName}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        mode={mode}
        renderSubComponent={renderSubComponent}
        emptyState={emptyState}
        onLoadMore={onLoadMore}
        hasNextPage={hasNextPage}
      />
    );
  };

  // ── Sticky offsets ────────────────────────────────────────────────────────
  const { getStickyStyle } = useStickyOffsets(table, stickyLeft, stickyRight);

  const showFooter   = enablePagination && mode !== 'infinite';
  const tableWidth   = enableVirtualization ? table.getTotalSize() : '100%';
  const showToolbar  = enableGlobalSearch || enableFiltering || enableExport;

  // Ghost label for the column being dragged
  const activeDragLabel = activeDragId
    ? table.getColumn(activeDragId)?.columnDef.header as string | undefined
    : null;

  // ── Don't render until persistence has loaded (prevents layout flash) ─────
  if (persistenceKey && !persistenceLoaded) {
    return (
      <div
        className={className}
        style={{ height, maxHeight: containerMaxHeight }}
        aria-busy="true"
      />
    );
  }

  // ── Main markup ───────────────────────────────────────────────────────────
  const tableMarkup = (
    <TableContainer className={containerClassName} aria-label={ariaLabel} aria-labelledby={ariaLabelledby}>
      <TableBodyWrapper ref={bodyRef} height={height} maxHeight={containerMaxHeight}>
        <Table style={{ width: tableWidth, minWidth: '100%' }}>
          <TableHeader
            table={table}
            stickyLeft={stickyLeft}
            stickyRight={stickyRight}
            getStickyStyle={getStickyStyle}
            enableSticky={enableStickyHeader}
            className={typeof headerClassName === 'string' ? headerClassName : ''}
            headerClassName={headerClassName}
            columnsWithSearch={columnsWithSearch}
            columnsWithSort={columnsWithSort}
            enableColumnReordering={enableColumnReordering}
            lockedIds={lockedIds}
            draggableIds={draggableIds}
          />
          {renderBody()}
        </Table>
      </TableBodyWrapper>

      {showFooter && (
        <TableFooter
          table={table}
          totalRows={totalRows}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      )}
    </TableContainer>
  );

  return (
    <div className={`space-y-0 ${className ?? ''}`}>
      {showToolbar && (
        <TableToolbar<T>
          table={table}
          enableGlobalSearch={enableGlobalSearch}
          enableFiltering={enableFiltering}
          enableExport={enableExport}
          filteringConfig={filteringConfig}
          columnsWithSearch={columnsWithSearch}
          columnsWithSort={columnsWithSort}
          onToggleColumnSearch={handleToggleColumnSearch}
          onToggleColumnSort={handleToggleColumnSort}
          onClearSearch={handleClearSearch}
          onClearAll={handleClearAll}
          customActions={toolbarConfig?.customActions}
        />
      )}

      {enableColumnReordering ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEndWrapped}
        >
          {tableMarkup}
          {/* Floating label that follows the cursor while dragging */}
          <DragOverlay>
            {activeDragLabel ? (
              <div className="px-3 py-1.5 rounded shadow-lg bg-white dark:bg-gray-800 border border-blue-400 dark:border-blue-500 text-[11px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 pointer-events-none select-none">
                {activeDragLabel}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        tableMarkup
      )}
    </div>
  );
}