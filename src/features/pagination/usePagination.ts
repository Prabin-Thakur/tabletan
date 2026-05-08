import { useCallback, useState } from 'react';
import { PaginationType, OffsetPagination, CursorPagination } from '../../utils/types';

interface UsePaginationProps {
  type?: 'offset' | 'cursor';
  initialPageSize?: number;
  totalRows?: number;
  onPageChange?: (pagination: PaginationType) => void;
}

/**
 * Hook for handling different pagination types: offset, cursor, and infinite scroll
 * 
 * @example - Offset Pagination
 * const pagination = usePagination({
 *   type: 'offset',
 *   totalRows: 1000,
 *   onPageChange: (pagination) => fetchPage(pagination.pageIndex)
 * });
 * 
 * @example - Cursor Pagination
 * const pagination = usePagination({
 *   type: 'cursor',
 *   onPageChange: (pagination) => fetchPage(pagination.cursor)
 * });
 */
export const usePagination = ({
  type = 'offset',
  initialPageSize = 20,
  totalRows,
  onPageChange,
}: UsePaginationProps = {}) => {
  // Offset Pagination State
  const [offsetState, setOffsetState] = useState<Omit<OffsetPagination, 'type'>>({
    pageIndex: 0,
    pageSize: initialPageSize,
    pageCount: totalRows ? Math.ceil(totalRows / initialPageSize) : undefined,
  });

  // Cursor Pagination State
  const [cursorState, setCursorState] = useState<Omit<CursorPagination, 'type'>>({
    cursor: null,
    hasNextPage: true,
    hasPreviousPage: false,
  });

  const handleOffsetChange = useCallback(
    (updates: Partial<Omit<OffsetPagination, 'type'>>) => {
      const newState = { ...offsetState, ...updates };
      setOffsetState(newState);
      
      if (onPageChange) {
        onPageChange({ type: 'offset', ...newState });
      }
    },
    [offsetState, onPageChange]
  );

  const handleCursorChange = useCallback(
    (updates: Partial<Omit<CursorPagination, 'type'>>) => {
      const newState = { ...cursorState, ...updates };
      setCursorState(newState);
      
      if (onPageChange) {
        onPageChange({ type: 'cursor', ...newState });
      }
    },
    [cursorState, onPageChange]
  );

  // Navigation methods
  const nextPage = useCallback(() => {
    if (type === 'offset') {
      handleOffsetChange({ pageIndex: offsetState.pageIndex + 1 });
    }
  }, [type, offsetState.pageIndex, handleOffsetChange]);

  const previousPage = useCallback(() => {
    if (type === 'offset') {
      handleOffsetChange({ pageIndex: Math.max(0, offsetState.pageIndex - 1) });
    }
  }, [type, offsetState.pageIndex, handleOffsetChange]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (type === 'offset') {
        handleOffsetChange({ pageIndex });
      }
    },
    [type, handleOffsetChange]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      if (type === 'offset') {
        const pageCount = totalRows ? Math.ceil(totalRows / pageSize) : undefined;
        handleOffsetChange({ pageSize, pageIndex: 0, pageCount });
      }
    },
    [type, totalRows, handleOffsetChange]
  );

  const setCursor = useCallback(
    (cursor: string | null, direction: 'next' | 'previous') => {
      if (type === 'cursor') {
        handleCursorChange({
          cursor,
          hasNextPage: direction === 'next' ? true : cursorState.hasNextPage,
          hasPreviousPage: direction === 'previous' ? true : cursorState.hasPreviousPage,
        });
      }
    },
    [type, cursorState, handleCursorChange]
  );

  return {
    // Current state
    pagination: type === 'offset' 
      ? { type: 'offset', ...offsetState }
      : { type: 'cursor', ...cursorState },
    
    // Navigation methods
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    setCursor,
    
    // Offset specific
    pageIndex: type === 'offset' ? offsetState.pageIndex : undefined,
    pageSize: type === 'offset' ? offsetState.pageSize : undefined,
    
    // Cursor specific
    cursor: type === 'cursor' ? cursorState.cursor : undefined,
    hasNextPage: type === 'cursor' ? cursorState.hasNextPage : undefined,
    hasPreviousPage: type === 'cursor' ? cursorState.hasPreviousPage : undefined,
  };
};