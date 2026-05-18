import React, { useLayoutEffect, useRef } from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { CLASSES } from '../utils/constants';

interface TableRowProps<T> {
  row: Row<T>;
  stickyLeft?: string[];
  stickyRight?: string[];
  getStickyStyle: (columnId: string) => React.CSSProperties;
  rowClassName?: string | ((row: Row<T>) => string);
  cellClassName?: string | ((cell: any) => string);
  onRowClick?: (row: Row<T>) => void;
  onRowDoubleClick?: (row: Row<T>) => void;
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactNode;
  
  // Virtualization props
  virtualizer: any;
  index: number;
  style?: React.CSSProperties;
}

export const TableRow = <T,>({
  row,
  stickyLeft,
  stickyRight,
  getStickyStyle,
  rowClassName,
  cellClassName,
  onRowClick,
  onRowDoubleClick,
  renderSubComponent,
  virtualizer,
  index,
  style,
}: TableRowProps<T>) => {
  const isSelected = row.getIsSelected();
  const isExpanded = row.getIsExpanded();
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the virtualizer's measureElement on the outer container
  useLayoutEffect(() => {
    if (containerRef.current && virtualizer) {
      virtualizer.measureElement(containerRef.current);
    }
  }, [isExpanded, virtualizer]); 

  return (
    <div
      ref={containerRef}
      data-index={index}
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
      className="group/row-container"
    >
      {/* Main Row */}
      <tr
        style={{
          display: 'flex',
          width: '100%',
        }}
        className={`
          ${CLASSES.ROW}
          ${onRowClick ? 'cursor-pointer' : ''}
          ${isSelected ? '!bg-blue-50 dark:!bg-blue-900/20' : ''}
          ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || ''}
        `}
        onClick={() => onRowClick?.(row)}
        onDoubleClick={() => onRowDoubleClick?.(row)}
      >
        {row.getVisibleCells().map((cell) => {
          const stickyStyle = getStickyStyle(cell.column.id);
          const isSticky = !!stickyStyle.position;
          const isLastLeftSticky = stickyLeft?.[stickyLeft.length - 1] === cell.column.id;
          const isFirstRightSticky = stickyRight?.[0] === cell.column.id;
          const columnDef = cell.column.columnDef as any;
          const contentAlign = columnDef.contentAlign || 'left';
          const verticalAlign = columnDef.verticalAlign || 'center';
          const grow = columnDef.grow;

          return (
            <td
              key={cell.id}
              style={{
                width: grow ? 'auto' : cell.column.getSize(),
                minWidth: cell.column.getSize(),
                maxWidth: grow ? undefined : cell.column.getSize(),
                flexGrow: grow ? 1 : 0,
                flexBasis: grow ? 0 : cell.column.getSize(),
                ...stickyStyle,
                display: 'flex',
                alignItems: verticalAlign === 'top'
                  ? 'flex-start'
                  : verticalAlign === 'bottom'
                  ? 'flex-end'
                  : 'center',
                justifyContent: contentAlign === 'center'
                  ? 'center'
                  : contentAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
                flexShrink: 0,
                zIndex: isSticky ? 30 : 0,
              }}
              className={`
                ${CLASSES.CELL}
                ${
                  contentAlign === 'center'
                    ? 'text-center'
                    : contentAlign === 'right'
                    ? 'text-right'
                    : 'text-left'
                }
                border-r border-gray-200 dark:border-gray-700
                ${isSticky ? `${CLASSES.STICKY_BACKGROUND} ${isSelected ? '!bg-blue-50 dark:!bg-blue-900/20' : ''}` : ''}
                ${isLastLeftSticky ? 'border-r-2 !border-r-gray-200 dark:!border-r-gray-700' : ''}
                ${isFirstRightSticky ? 'border-l-2 !border-l-gray-200 dark:!border-l-gray-700' : ''}
                ${typeof cellClassName === 'function' ? cellClassName(cell) : cellClassName || ''}
              `}
            >
              <div className="w-full truncate" title={cell.getValue() as string}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </td>
          );
        })}
      </tr>

      {/* Sub-component Expansion */}
      {isExpanded && renderSubComponent && (
        <tr
          className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700"
          style={{ display: 'flex', width: '100%' }}
        >
          <td className="p-0 border-none w-full">
            {renderSubComponent({ row })}
          </td>
        </tr>
      )}
    </div>
  );
};