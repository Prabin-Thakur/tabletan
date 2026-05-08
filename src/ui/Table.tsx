import React, { forwardRef } from 'react';
import { CLASSES } from '../utils/constants';

interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Outer table wrapper [container]
 */
export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${CLASSES.TABLE_CONTAINER} ${className || ''}`}
        {...props}
        
      >
        {children}
      </div>
    );
  }
);
TableContainer.displayName = 'TableContainer';

/**
 * Main table component
 */
export const Table = forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement> & {
    layout?: 'auto' | 'fixed';
  }
>(({ className, layout = 'fixed', ...props }, ref) => {
  return (
    <table
      ref={ref}
      className={`${CLASSES.TABLE} w-full table-${layout} ${className || ''}`}
      {...props}
    />
  );
});
Table.displayName = 'Table';

interface TableBodyWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
  height?: string;
}

/**
 * Scrollable table body wrapper
 */
export const TableBodyWrapper = forwardRef<
  HTMLDivElement,
  TableBodyWrapperProps
>(({ children, className, maxHeight, height, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="region"
      aria-label="Table content"
      // tabIndex={0}
      className={`overflow-auto relative ${CLASSES.SCROLLBAR_STYLES} ${className || ''}`}
      style={{ maxHeight, height }}
      {...props}
    >
      {children}
    </div>
  );
});
TableBodyWrapper.displayName = 'TableBodyWrapper';