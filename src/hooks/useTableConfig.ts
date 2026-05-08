import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
  Table,
} from '@tanstack/react-table';
import { DataTableProps } from '../utils/types';

/**
 * Creates and configures TanStack Table instance
 */
export function useTableConfig<T>(props: DataTableProps<T>): Table<T> {
  const {
    data,
    columns,
    totalRows,
    paginationConfig,
    sortingConfig,
    filteringConfig,
    selectionConfig,
    enablePagination,
    enableFiltering,
    enableSelection,
    enableExpansion,
    enableColumnResizing,
    renderSubComponent,
    expanded,
    onExpandedChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = props;

  // Resolve feature flags — config presence implies the feature is enabled
  const _enablePagination  = enablePagination  ?? (paginationConfig  !== undefined);
  const _enableFiltering   = enableFiltering   ?? (filteringConfig   !== undefined);
  const _enableRowSelection = enableSelection  ?? (selectionConfig   !== undefined);
  const _enableExpansion   = enableExpansion   || !!renderSubComponent;

  // Sorting is always on at table level; per-column `enableSorting` overrides it
  const _enableSorting = true;

  return useReactTable({
    data,
    columns,

    // ── Controlled state ────────────────────────────────────────────────────
    state: {
      ...(_enableSorting  && sortingConfig?.state   ? { sorting:        sortingConfig.state }          : {}),
      ...(_enableFiltering && filteringConfig?.columnFilters  ? { columnFilters: filteringConfig.columnFilters } : {}),
      ...(_enableFiltering && filteringConfig?.globalFilter   ? { globalFilter:  filteringConfig.globalFilter }  : {}),
      ...(_enableRowSelection && selectionConfig?.state ? { rowSelection: selectionConfig.state } : {}),
      ...(_enablePagination
          && paginationConfig?.pageIndex !== undefined
          && paginationConfig?.pageSize  !== undefined
        ? { pagination: { pageIndex: paginationConfig.pageIndex, pageSize: paginationConfig.pageSize } }
        : {}),
      ...(expanded          !== undefined ? { expanded }          : {}),
      ...(columnVisibility  !== undefined ? { columnVisibility }  : {}),
      ...(props.columnOrder !== undefined ? { columnOrder: props.columnOrder } : {}),
    },

    // ── Event handlers ──────────────────────────────────────────────────────
    ...(_enableSorting  && sortingConfig?.onChange          ? { onSortingChange:          sortingConfig.onChange          as never } : {}),
    ...(_enableFiltering && filteringConfig?.onColumnFiltersChange ? { onColumnFiltersChange:  filteringConfig.onColumnFiltersChange as never } : {}),
    ...(_enableFiltering && filteringConfig?.onGlobalFilterChange  ? { onGlobalFilterChange:   filteringConfig.onGlobalFilterChange  as never } : {}),
    ...(_enableRowSelection && selectionConfig?.onChange    ? { onRowSelectionChange:      selectionConfig.onChange         as never } : {}),
    ...(_enablePagination   && paginationConfig?.onChange   ? { onPaginationChange:        paginationConfig.onChange        as never } : {}),
    ...(_enableExpansion    && onExpandedChange             ? { onExpandedChange:          onExpandedChange                 as never } : {}),
    ...(onColumnVisibilityChange                            ? { onColumnVisibilityChange:  onColumnVisibilityChange         as never } : {}),

    // ── Manual / server-side flags ──────────────────────────────────────────
    ...(paginationConfig?.manual ? { manualPagination: true } : {}),
    ...(sortingConfig?.manual    ? { manualSorting:    true } : {}),
    ...(filteringConfig?.manual  ? { manualFiltering:  true } : {}),

    // ── Row models — only include what's needed ─────────────────────────────
    getCoreRowModel:        getCoreRowModel(),
    getSortedRowModel:      getSortedRowModel(),               // always on; per-column flag controls visibility
    ...(_enableFiltering    ? { getFilteredRowModel:   getFilteredRowModel()   } : {}),
    ...(_enablePagination   ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(_enableExpansion    ? { getExpandedRowModel:   getExpandedRowModel()   } : {}),

    // ── Features ────────────────────────────────────────────────────────────
    enableSorting: true,
    ...(_enableFiltering !== undefined ? { enableColumnFilters: _enableFiltering } : {}),
    ...(_enableRowSelection ? { enableRowSelection: true } : {}),
    ...(_enableRowSelection && selectionConfig?.mode === 'multi' ? { enableMultiRowSelection: true } : {}),

    ...(_enableExpansion ? {
      enableExpanding: true,
      getSubRows:      (row: T) => (row as Record<string, unknown>).subRows as T[] | undefined,
      getRowCanExpand: (row)    => !!(row.original as Record<string, unknown>).subRows || !!renderSubComponent,
    } : { enableExpanding: false }),

    // Column resizing
    enableColumnResizing: enableColumnResizing ?? true,
    columnResizeMode: 'onChange',

    // Server-side page count
    ...(_enablePagination && paginationConfig?.manual && typeof totalRows === 'number' && paginationConfig?.pageSize
      ? { pageCount: Math.ceil(totalRows / paginationConfig.pageSize) }
      : {}),

    // Default column widths
    defaultColumn: { minSize: 50, maxSize: 800, size: 150 },

    // Stable row IDs so selection survives page changes
    getRowId: (originalRow: T, index: number) =>
      String((originalRow as Record<string, unknown>).id ?? (originalRow as Record<string, unknown>)._id ?? index),
  });
}
