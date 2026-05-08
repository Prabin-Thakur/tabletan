import { BaseTable } from './BaseTable';
import { DataTableProps } from './utils/types';

export type BasicTableProps<T> = Pick<
  DataTableProps<T>,
  // Data
  | 'data'
  | 'columns'
  | 'totalRows'
  // State
  | 'mode'
  | 'isLoading'
  | 'isFetching'
  | 'isError'
  | 'error'
  // Features
  | 'enablePagination'
  | 'paginationConfig'
  | 'enableVirtualization'
  | 'virtualizationConfig'
  | 'enableStickyHeader'
  | 'enableSelection'
  | 'selectionConfig'
  | 'enableGlobalSearch'
  | 'filteringConfig'
  | 'skeletonConfig'
  // Persistence
  | 'persistenceKey'
  // Styling
  | 'className'
  | 'containerClassName'
  | 'headerClassName'
  | 'bodyClassName'
  | 'rowClassName'
  | 'cellClassName'
  | 'height'
  | 'maxHeight'
  // Content slots
  | 'emptyState'
  | 'loadingState'
  | 'errorState'
  // Events
  | 'onRowClick'
  | 'onRowDoubleClick'
  // a11y
  | 'aria-label'
  | 'aria-labelledby'
>;

/**
 * Simplified table for everyday use.
 * Renders a fully-featured table with only the essential options exposed.
 * For advanced features (drag reordering, column filters, etc.) use `DataTable`.
 */
export function BasicTable<T>(props: BasicTableProps<T>) {
  return (
    <BaseTable
      {...props}
      // Disable all advanced features not exposed through BasicTableProps
      stickyLeft={undefined}
      stickyRight={undefined}
      enableExpansion={false}
      expanded={undefined}
      onExpandedChange={undefined}
      renderSubComponent={undefined}
      columnVisibility={undefined}
      onColumnVisibilityChange={undefined}
      sortingConfig={undefined}
      enableFiltering={false}
      enableColumnResizing={false}
      enableColumnReordering={false}
      onColumnOrderChange={undefined}
      enableExport={false}
    />
  );
}
