import { useState, useEffect, useRef, ReactNode } from 'react';
import { Table as TableType, Column } from '@tanstack/react-table';
import { Search, SlidersHorizontal, Download, X, Check, Columns } from './icons';
import { FilteringConfig } from '../utils/types';
import { DebouncedInput } from './DebouncedInput';
interface TableToolbarProps<T> {
  table: TableType<T>;
  enableGlobalSearch?: boolean;
  enableFiltering?: boolean;
  enableExport?: boolean;
  filteringConfig?: FilteringConfig;
  columnsWithSearch: Set<string>;
  columnsWithSort: Set<string>;
  onToggleColumnSearch: (colId: string) => void;
  onToggleColumnSort: (colId: string) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
  /** Extra elements rendered at the right of the toolbar */
  customActions?: ReactNode;
}

export const TableToolbar = <T,>({
  table,
  enableGlobalSearch = false,
  enableFiltering    = false,
  enableExport       = false,
  filteringConfig,
  columnsWithSearch,
  columnsWithSort,
  onToggleColumnSearch,
  onToggleColumnSort,
  onClearSearch,
  onClearAll,
  customActions,
}: TableToolbarProps<T>) => {
  const [showFilterMenu,  setShowFilterMenu]  = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close the column-toggle panel when clicking outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  
  const activeColumnFilters  = table.getState().columnFilters;
  const hasRealColumnFilter  = activeColumnFilters.some(f => !!f.value);
  const anyFilterOrSortActive = columnsWithSearch.size > 0 || columnsWithSort.size > 0;
  
  // Friendly label for a column (falls back to capitalised id)
  const getColumnLabel = (col: Column<T, unknown>): string => {
    const h = col.columnDef.header;
    if (typeof h === 'string') return h;
    return col.id === 'select' ? 'Selection' : col.id.charAt(0).toUpperCase() + col.id.slice(1);
  };

  // CSV export of currently visible + filtered rows
  const exportData = () => {
  const rows = table.getFilteredRowModel().rows;
  
  const cols = table
    .getVisibleLeafColumns()
    .filter(col => {
      const def = col.columnDef as any;

      // include only real data columns
      return def.accessorKey || def.accessorFn;
    });

  // Headers
  const headers = cols.map(col =>
    typeof col.columnDef.header === "string"
      ? col.columnDef.header
      : col.id
  );

  // Rows
  const data = rows.map(row =>
    cols.map(col => {
      const def = col.columnDef as any;
      let value = def.accessorFn
        ? def.accessorFn(row.original)
        : row.getValue(col.id);

      if (value == null) return "";

      if (typeof value === "string") {
        return `"${value.replace(/"/g, '""')}"`;
      }

      return value;
      }).join(",")
    );

    const csv = [headers.join(","), ...data].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));

    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
      {/* Global search input */}
      {enableGlobalSearch ? (
        <div className="relative flex-1 max-w-sm w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <DebouncedInput
            type="text"
            placeholder={filteringConfig?.searchPlaceholder || 'Search…'}
            value={filteringConfig?.globalFilter || ''}
            onChange={val => filteringConfig?.onGlobalFilterChange?.(String(val))}
            className="w-full pl-10 pr-9 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors shadow-sm"
          />
          {filteringConfig?.globalFilter && (
            <button
              onClick={() => filteringConfig?.onGlobalFilterChange?.('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1" /> // Spacer so right-side buttons stay aligned
      )}

      <div className="flex items-center gap-2">
        {/* Clear column filters button */}
        {enableFiltering && hasRealColumnFilter && (
          <button
            onClick={onClearSearch}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 shadow-sm transition-all"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear Search</span>
          </button>
        )}

        {/* View button — opens the column panel */}
        {enableFiltering && (
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all ${
                showFilterMenu
                  ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-400'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>View</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-[60] flex flex-col ring-1 ring-black/5 dark:ring-white/5">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                    <Columns className="h-3.5 w-3.5" />
                    Columns
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {table.getVisibleLeafColumns().length} visible
                  </span>
                </div>

                {/* Column list */}
                <div className="max-h-[320px] overflow-y-auto py-1.5">
                  {table.getAllLeafColumns().filter(col => col.getCanHide()).map(column => {
                      const isVisible = column.getIsVisible();
                      const searchOn  = columnsWithSearch.has(column.id);
                      const sortOn    = columnsWithSort.has(column.id);
                      return (
                        <div key={column.id} className="px-2">
                          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group select-none">
                            {/* Visibility checkbox */}
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                              <div className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 transition-all ${
                                isVisible ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-blue-400'
                              }`}>
                                <Check className={`h-3 w-3 text-white transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
                              </div>
                              <input type="checkbox" checked={isVisible} onChange={column.getToggleVisibilityHandler()} className="hidden" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{getColumnLabel(column)}</span>
                            </label>

                            {/* Search + Sort toggles (only for visible columns) */}
                            {isVisible && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => onToggleColumnSearch(column.id)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border ${
                                    searchOn
                                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700'
                                      : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                  }`}
                                  title={searchOn ? 'Disable search' : 'Enable search'}
                                >
                                  <Search className="h-3 w-3" />
                                  <span>Search</span>
                                </button>
                                <button
                                  onClick={() => onToggleColumnSort(column.id)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border ${
                                    sortOn
                                      ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700'
                                      : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                  }`}
                                  title={sortOn ? 'Disable sort' : 'Enable sort'}
                                >
                                  <span>Sort</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                {/* Panel footer */}
                <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl flex gap-2">
                  <button
                    onClick={() => table.toggleAllColumnsVisible(true)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    Reset visibility
                  </button>
                  {anyFilterOrSortActive && (
                    <button
                      onClick={onClearAll}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Export */}
        {enableExport && (
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}
        
        {/* Extra buttons from toolbarConfig.customActions */}
        {customActions}
      </div>
    </div>
  );
};