import { useVirtualizer } from '@tanstack/react-virtual';
import { RefObject, useEffect } from 'react';
import { DEFAULT_CONFIG } from '../../utils/constants';

interface UseVirtualRowsProps {
  parentRef: RefObject<HTMLElement | null>;
  rowCount: number;
  estimateSize?: number;
  overscan?: number;
}

/**
 * Hook for virtualizing table rows with dynamic height support
 * Relying on measureElement for accurate sizing of expanded/variable rows.
 */
export const useVirtualRows = ({
  parentRef,
  rowCount,
  estimateSize = DEFAULT_CONFIG.ROW_HEIGHT,
  overscan = DEFAULT_CONFIG.OVERSCAN,
}: UseVirtualRowsProps) => {
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  // Re-measure when rowCount changes
  useEffect(() => {
    virtualizer.measure();
  }, [rowCount, virtualizer]);

  return virtualizer;
};