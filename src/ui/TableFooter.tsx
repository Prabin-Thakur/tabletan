import { useState } from 'react';
import { Table as TableType } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from './icons';

interface TableFooterProps<T> {
  table: TableType<T>;
  totalRows?: number;
  isLoading?: boolean;
  isFetching?: boolean;
  className?: string;
  showPageSizeSelector?: boolean;
  showGoToPage?: boolean;
  showTotalRows?: boolean;
}

/**
 * Enhanced Table Footer with comprehensive pagination controls
 */
export const TableFooter = <T,>({
  table,
  totalRows = 0,
  isLoading = false,
  isFetching = false,
  className = '',
  showPageSizeSelector = true,
  showGoToPage = true,
  showTotalRows = true,
}: TableFooterProps<T>) => {
  const [goToPageInput, setGoToPageInput] = useState('');
  
  const state = table.getState();
  const pagination = state.pagination;
  const rowSelection = state.rowSelection || {};
  
  if (!pagination) return null;

  const { pageIndex, pageSize } = pagination;
  
  const pageCount = table.getPageCount();
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  
  const isBusy = isLoading || isFetching;

  const handlePageChange = (newPageIndex: number) => {
    table.setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    table.setPageSize(newPageSize);
  };

  const handleGoToPageSubmit = () => {
    if (!goToPageInput) return;
    
    const pageNum = parseInt(goToPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageCount) {
      handlePageChange(pageNum - 1);
      setGoToPageInput('');
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (pageCount <= maxVisiblePages) {
      for (let i = 0; i < pageCount; i++) pages.push(i);
    } else {
      let start = Math.max(0, pageIndex - Math.floor(maxVisiblePages / 2));
      let end = start + maxVisiblePages;
      if (end > pageCount) {
        end = pageCount;
        start = Math.max(0, end - maxVisiblePages);
      }
      for (let i = start; i < end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`
      flex flex-col sm:flex-row items-center justify-between gap-4 
      px-4 py-3 border-t border-gray-200 dark:border-gray-800 
      bg-white dark:bg-gray-900 rounded-b-lg 
      relative z-[30]
      ${className}
    `}>
      {/* Left side: Row info and selection */}
      <div className="flex flex-wrap items-center gap-4 flex-1">
        {showTotalRows && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isBusy ? (
               <span className="flex items-center gap-2">
                 <span className="w-4 h-4 rounded-full border-2 border-primary border-r-transparent animate-spin" />
                 Loading...
               </span>
            ) : totalRows > 0 ? (
              <>
                Showing{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{startRow}</span>
                {' '}to{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{endRow}</span>
                {' '}of{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{totalRows}</span>
                {' '}results
              </>
            ) : (
                <span>No results found</span>
            )}
          </div>
        )}

        {Object.keys(rowSelection).length > 0 && (
          <div className="text-sm text-blue-600 dark:text-blue-400">
            {Object.keys(rowSelection).length} row(s) selected
          </div>
        )}
      </div>

      {/* Right side: Pagination controls */}
      <div className="flex items-center gap-3">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={isBusy}
              className="text-gray-600 dark:text-gray-400 text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(0)}
            disabled={!canPreviousPage || isBusy}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage || isBusy}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((pi) => (
              <button
                key={pi}
                onClick={() => handlePageChange(pi)}
                disabled={isBusy}
                className={`
                  min-w-[32px] px-2 py-1.5 text-sm rounded-md border transition-colors
                  ${pageIndex === pi
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                  ${isBusy ? 'opacity-50' : ''}
                `}
              >
                {pi + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => table.nextPage()}
            disabled={!canNextPage || isBusy}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={!canNextPage || isBusy}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
        
        {showGoToPage && pageCount > 1 && (
          <div className="flex items-center gap-1">
             <input
                type="number"
                min="1"
                max={pageCount}
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoToPageSubmit()}
                disabled={isBusy}
                className="w-16.5 px-2 py-1.5 text-gray-600 dark:text-gray-400 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Go to"
              />
          </div>
        )}
      </div>
    </div>
  );
};