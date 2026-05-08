import { CSSProperties } from 'react';

/**
 * Generates CSS styles for a virtualized row with absolute positioning
 * 
 * @example
 * <tr style={getVirtualRowStyle(row.start)}>
 *   {/* row content *\/}
 * </tr>
 */
export const getVirtualRowStyle = (
  start: number,
  isSticky?: boolean
): CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  transform: `translateY(${start}px)`,
  // Ensure virtual rows have proper z-index for sticky columns
  zIndex: isSticky ? 1 : 'auto',
  // Force GPU acceleration for smooth scrolling
  willChange: 'transform',
});

/**
 * Gets row height dynamically for expandable rows
 */
export const getDynamicRowHeight = <T>(
  row: T,
  isExpanded: boolean,
  baseHeight: number = 48,
  expandedHeight?: (row: T) => number
): number => {
  if (isExpanded && expandedHeight) {
    return expandedHeight(row);
  }
  
  return baseHeight;
};