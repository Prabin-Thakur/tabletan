// ─── Styles
import './index.css';

// ─── Main components ─────────────────────────────────────────────────────────
export { DataTable }               from './DataTable';
export { BasicTable }              from './BasicTable';
export type { BasicTableProps }    from './BasicTable';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  // Main
  DataTableProps,
  DataTableColumnDef,
  DataTableMode,
  // Feature configs
  PaginationConfig,
  SortingConfig,
  FilteringConfig,
  SelectionConfig,
  VirtualizationConfig,
  SkeletonConfig,
  ToolbarConfig,
  // Primitives
  SelectionMode,
  // Pagination hook types
  PaginationType,
  OffsetPagination,
  CursorPagination,
  // TanStack re-exports (so consumers only need one import)
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  ExpandedState,
} from './utils/types';

// ─── Feature hooks (for custom wrappers) ─────────────────────────────────────
export { usePagination } from './features/pagination/usePagination';
