import {
  ColumnDef,
  Row,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  ExpandedState,
} from '@tanstack/react-table';
import { ReactNode } from 'react';



// Table Modes
export type DataTableMode = 'client' | 'server' | 'infinite';

export type SelectionMode = 'single' | 'multi';

// ─── Pagination Types (for usePagination hook) ────────────────────────────────

export interface OffsetPagination {
  type: 'offset';
  pageIndex: number;
  pageSize: number;
  pageCount?: number;
}

export interface CursorPagination {
  type: 'cursor';
  cursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type PaginationType = OffsetPagination | CursorPagination;

// ─── Feature Config Interfaces ────────────────────────────────────────────────

export interface PaginationConfig {
  /** true = your server controls pages, false = table handles it client-side */
  manual?: boolean;
  pageIndex?: number;
  pageSize?: number;
  /** Called with the new PaginationState whenever page/size changes */
  onChange?: (pagination: PaginationState) => void;
}

export interface SortingConfig {
  /** true = your server controls sorting, false = table sorts client-side */
  manual?: boolean;
  /** Current sorting state (for controlled / server-side mode) */
  state?: SortingState;
  /** Called with the new SortingState whenever sort changes */
  onChange?: (sorting: SortingState) => void;
}

export interface FilteringConfig {
  /** Current global search string */
  globalFilter?: string;
  /** Called when the user types in the global search box */
  onGlobalFilterChange?: (filter: string) => void;
  /** Current per-column filter values */
  columnFilters?: ColumnFiltersState;
  /** Called when a per-column filter changes */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  /** Placeholder text for the global search input */
  searchPlaceholder?: string;
  /** true = your server handles filtering */
  manual?: boolean;
}

export interface SelectionConfig {
  mode?: SelectionMode;
  /** Current row-selection state map { [rowId]: boolean } */
  state?: RowSelectionState;
  /** Called with the new selection map whenever a row is toggled */
  onChange?: (selection: RowSelectionState) => void;
}

export interface VirtualizationConfig {
  /** Estimated row height (px) — used before rows are measured */
  estimateRowHeight?: number;
  /** How many extra rows to render above/below the visible window */
  overscan?: number;
}

export interface SkeletonConfig {
  /** How many placeholder rows to show while loading */
  rowCount?: number;
}

/** Toolbar customisation (only relevant when `enableGlobalSearch`, `enableFiltering`, or `enableExport` is true) */
export interface ToolbarConfig {
  /** Extra buttons/elements rendered at the right of the toolbar */
  customActions?: ReactNode;
}

// ─── Column Definition ────────────────────────────────────────────────────────

/**
 * Extends TanStack's ColumnDef with extra styling/behaviour options.
 * Use this type for your column array instead of the raw ColumnDef.
 */
export type DataTableColumnDef<T, TValue = unknown> = ColumnDef<T, TValue> & {
  /** When true the column stretches to fill remaining space (like CSS flex-grow) */
  grow?: boolean;
  /** Prevent this column from being drag-reordered */
  enableDragging?: boolean;
  /** Horizontal alignment of cell content */
  contentAlign?: 'left' | 'center' | 'right';
  /** Vertical alignment of cell content */
  verticalAlign?: 'top' | 'center' | 'bottom';
};

// ─── Main Props Interface ─────────────────────────────────────────────────────

export interface DataTableProps<T> {
  // ── Required ──────────────────────────────────────────────────────────────
  data: T[];
  columns: DataTableColumnDef<T, unknown>[];

  // ── Data / Loading ────────────────────────────────────────────────────────
  /** Total row count from the server (needed for server-side pagination) */
  totalRows?: number;
  /** 'client' | 'server' | 'infinite'  (default: 'client') */
  mode?: DataTableMode;
  /** True while the initial page is loading — shows skeleton rows */
  isLoading?: boolean;
  /** True while a subsequent fetch is in flight */
  isFetching?: boolean;
  isError?: boolean;
  error?: Error | null;

  // ── Feature Flags ─────────────────────────────────────────────────────────
  enablePagination?: boolean;
  paginationConfig?: PaginationConfig;

  /** Passed to `sortingConfig.onChange` to handle sort state */
  sortingConfig?: SortingConfig;

  enableFiltering?: boolean;
  filteringConfig?: FilteringConfig;

  /** Render a global search box above the table */
  enableGlobalSearch?: boolean;

  /** Add a CSV export button */
  enableExport?: boolean;

  /** Toolbar customisation (column toggle, extra actions) */
  toolbarConfig?: ToolbarConfig;

  enableSelection?: boolean;
  selectionConfig?: SelectionConfig;

  enableVirtualization?: boolean;
  virtualizationConfig?: VirtualizationConfig;

  /** How many skeleton rows to show while loading */
  skeletonConfig?: SkeletonConfig;

  /** Allow columns to be resized by dragging their edge */
  enableColumnResizing?: boolean;

  /** Allow columns to be drag-reordered */
  enableColumnReordering?: boolean;
  /** Called with the new column order array after a drag */
  onColumnOrderChange?: (order: string[]) => void;
  /** Current column order (managed internally; pass through from BaseTable) */
  columnOrder?: string[];

  /** Keep the header pinned while the body scrolls */
  enableStickyHeader?: boolean;
  /** Column IDs to pin on the left */
  stickyLeft?: string[];
  /** Column IDs to pin on the right */
  stickyRight?: string[];

  // ── Row Expansion ─────────────────────────────────────────────────────────
  enableExpansion?: boolean;
  expanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;

  // ── Column Visibility ─────────────────────────────────────────────────────
  /** Controlled visibility map — omit to let the table manage it internally */
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;

  // ── Layout ────────────────────────────────────────────────────────────────
  /** Fixed height of the scroll container (e.g. '500px') */
  height?: string;
  /** Max height — useful when you want the table to grow up to a limit */
  maxHeight?: string;

  // ── Styling ───────────────────────────────────────────────────────────────
  /** Class on the outermost wrapper div */
  className?: string;
  /** Class on the bordered container (the card) */
  containerClassName?: string;
  /** Class on `<thead>` — or a function returning a class per header cell */
  headerClassName?: string | ((header: import('@tanstack/react-table').Header<T, unknown>) => string);
  /** Class on `<tbody>` */
  bodyClassName?: string;
  /** Class on each row `<tr>` — or a function for per-row styling */
  rowClassName?: string | ((row: Row<T>) => string);
  /** Class on each cell `<td>` — or a function for per-cell styling */
  cellClassName?: string | ((cell: import('@tanstack/react-table').Cell<T, unknown>) => string);

  // ── Custom Slots ──────────────────────────────────────────────────────────
  /** Shown when there are no rows */
  emptyState?: ReactNode;
  /** Replaces the default skeleton/spinner while isLoading is true */
  loadingState?: ReactNode;
  /** Replaces the default error message when isError is true */
  errorState?: ReactNode;

  // ── Sub-rows / Expansion ─────────────────────────────────────────────────
  /** Render extra content below an expanded row */
  renderSubComponent?: (props: { row: Row<T> }) => ReactNode;

  // ── Events ────────────────────────────────────────────────────────────────
  onRowClick?: (row: Row<T>) => void;
  onRowDoubleClick?: (row: Row<T>) => void;

  // ── Infinite Scroll ───────────────────────────────────────────────────────
  onLoadMore?: () => void;
  hasNextPage?: boolean;

  // ── Persistence ───────────────────────────────────────────────────────────
  /**
   * Unique string key for this table.
   * When provided, column order, visibility, sorting and filters are
   * automatically saved to IndexedDB and restored on next mount.
   */
  persistenceKey?: string;

  // ── Accessibility ─────────────────────────────────────────────────────────
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// ─── Re-exports ───────────────────────────────────────────────────────────────
// Convenient re-exports so consumers only need one import path.
export type {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  ExpandedState,
};