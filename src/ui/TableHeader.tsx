import { flexRender, type Header, type Table as TableType } from '@tanstack/react-table';
import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from './icons';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CLASSES } from '../utils/constants';
import { DraggableHeaderCell } from './DraggableHeader';
import { DebouncedInput } from './DebouncedInput';

interface TableHeaderProps<T> {
  table: TableType<T>;
  stickyLeft?: string[];
  stickyRight?: string[];
  getStickyStyle: (columnId: string) => React.CSSProperties;
  className?: string;
  headerClassName?: string | ((header: Header<T, unknown>) => string);
  enableSticky?: boolean;
  columnsWithSearch?: Set<string>;
  columnsWithSort?: Set<string>;
  enableColumnReordering?: boolean;
  lockedIds?: string[];
  draggableIds?: string[];
}

// Tailwind classes for sticky header look
const S = {
  HEADER:       'sticky top-0 z-[40]',
  BG_STICKY:    'bg-gray-100 dark:bg-gray-800',
  BG_NORMAL:    'bg-gray-50 dark:bg-gray-900',
  BORDER_RIGHT: 'border-r-2 !border-r-gray-200 dark:!border-r-gray-700',
  BORDER_LEFT:  'border-l-2 !border-l-gray-200 dark:!border-l-gray-700',
};

export const TableHeader = <T,>({
  table,
  className       = '',
  headerClassName = '',
  stickyLeft,
  stickyRight,
  getStickyStyle,
  enableSticky   = true,
  columnsWithSearch = new Set(),
  columnsWithSort   = new Set(),
  enableColumnReordering = false,
  lockedIds   = [],
  draggableIds = [],
}: TableHeaderProps<T>) => {

  // Returns extra border class for the last left-sticky / first right-sticky column
  const getStickyBorderClass = (colId: string) => {
    let c = '';
    if (!enableSticky) return c;
    if (stickyLeft?.[stickyLeft.length - 1] === colId)  c += ' ' + S.BORDER_RIGHT;
    if (stickyRight?.[0] === colId)                      c += ' ' + S.BORDER_LEFT;
    return c;
  };

  // Shared flex sizing used by both the header row and the filter row
  const getColStyle = (
    header: Header<T, unknown>,
    stickyStyle: React.CSSProperties,
    isSticky: boolean,
  ): React.CSSProperties => {
    const def          = header.column.columnDef as { grow?: boolean; contentAlign?: string };
    const grow         = def.grow;
    const contentAlign = def.contentAlign ?? 'left';
    const size         = header.getSize();
    return {
      width:          grow ? 'auto' : size,
      minWidth:       size,
      maxWidth:       grow ? undefined : size,
      flexGrow:       grow ? 1 : 0,
      flexBasis:      grow ? 0 : size,
      flexShrink:     0,
      display:        'flex',
      justifyContent: contentAlign === 'center' ? 'center' : contentAlign === 'right' ? 'flex-end' : 'flex-start',
      ...(enableSticky
        ? { ...stickyStyle, position: isSticky ? 'sticky' : 'relative', top: isSticky ? 0 : undefined, zIndex: isSticky ? 50 : 40 }
        : { position: 'relative' }),
    };
  };

  // Only show the search row when at least one visible column has it enabled
  const hasSearchRow =
    columnsWithSearch.size > 0 &&
    table.getAllLeafColumns().some(col => col.getIsVisible() && columnsWithSearch.has(col.id));

  // Shared per-header-cell data — computed once and passed to both render paths
  const getCellData = (header: Header<T, unknown>) => {
    const stickyStyle   = getStickyStyle(header.column.id);
    const isSticky      = enableSticky && !!stickyStyle.position;
    const isResizing    = header.column.getIsResizing();
    const isSortEnabled = columnsWithSort.has(header.column.id) && header.column.getCanSort();
    const isSorted      = header.column.getIsSorted();
    const hasFilter     = !!header.column.getFilterValue() || !!isSorted;
    const extraClass    = typeof headerClassName === 'function' ? headerClassName(header) : headerClassName;
    const colStyle      = getColStyle(header, stickyStyle, isSticky);
    const sharedClass   = `
      ${CLASSES.CELL}
      border-b border-r border-gray-200 dark:border-gray-700
      text-gray-600 dark:text-gray-300
      ${isSticky ? S.BG_STICKY : S.BG_NORMAL}
      ${getStickyBorderClass(header.column.id)}
      ${extraClass}
      ${isResizing ? 'select-none cursor-col-resize' : ''}
    `;
    return { stickyStyle, isSticky, isResizing, isSortEnabled, isSorted, hasFilter, colStyle, sharedClass };
  };

  // Resize handle element reused in both draggable and plain cells
  const resizeHandle = (header: Header<T, unknown>, isSticky: boolean) =>
    header.column.getCanResize() ? (
      <div
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={`
          absolute top-0 right-0 h-full w-1
          cursor-col-resize select-none touch-none
          hover:bg-blue-500 active:bg-blue-600
          ${header.column.getIsResizing() ? 'bg-blue-500' : ''}
          ${isSticky ? 'z-[60]' : ''}
        `}
      />
    ) : null;

  return (
    <thead className={`${CLASSES.HEADER} ${enableSticky ? S.HEADER : ''} ${className}`}>
      {table.getHeaderGroups().map((headerGroup, groupIdx, allGroups) => {
        // Only the first row gets drag-and-drop wrappers
        const isDraggableRow = enableColumnReordering && groupIdx === 0;

        return (
          <React.Fragment key={headerGroup.id}>
            {/* ── Main header row ──────────────────────────────────── */}
            <tr className="relative flex w-full">
              {isDraggableRow ? (
                <SortableContext items={draggableIds} strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map(header => {
                    const { colStyle, sharedClass, isSticky, isResizing, isSortEnabled, isSorted, hasFilter } = getCellData(header);
                    const isLocked = lockedIds.includes(header.column.id);
                    return (
                      <DraggableHeaderCell
                        key={header.id}
                        id={header.column.id}
                        isLocked={isLocked}
                        colSpan={header.colSpan}
                        style={colStyle}
                        className={`group/th ${sharedClass} ${!isLocked ? 'pl-5' : ''}`}
                      >
                        <HeaderContent header={header} hasFilter={hasFilter} isSortEnabled={isSortEnabled} isSorted={isSorted} />
                        {resizeHandle(header, isSticky)}
                      </DraggableHeaderCell>
                    );
                  })}
                </SortableContext>
              ) : (
                headerGroup.headers.map(header => {
                  const { colStyle, sharedClass, isSticky, isSortEnabled, isSorted, hasFilter } = getCellData(header);
                  return (
                    <th key={header.id} colSpan={header.colSpan} style={colStyle} className={sharedClass}>
                      <HeaderContent header={header} hasFilter={hasFilter} isSortEnabled={isSortEnabled} isSorted={isSorted} />
                      {resizeHandle(header, isSticky)}
                    </th>
                  );
                })
              )}
            </tr>

            {/* ── Per-column search row (only on leaf/last header group) ── */}
            {groupIdx === allGroups.length - 1 && hasSearchRow && (
              <tr className="relative flex w-full border-b border-gray-200 dark:border-gray-700">
                {headerGroup.headers.map(header => {
                  const stickyStyle   = getStickyStyle(header.column.id);
                  const isSticky      = enableSticky && !!stickyStyle.position;
                  const isSearchActive = columnsWithSearch.has(header.column.id) && header.column.getIsVisible();
                  const filterVal     = (header.column.getFilterValue() as string) || '';
                  return (
                    <th
                      key={`filter-${header.id}`}
                      style={getColStyle(header, stickyStyle, isSticky)}
                      className={`
                        px-2 py-1.5 border-b border-r border-gray-200 dark:border-gray-700
                        ${isSticky ? S.BG_STICKY : S.BG_NORMAL}
                        ${getStickyBorderClass(header.column.id)}
                      `}
                    >
                      {isSearchActive ? (
                        <div className="relative w-full group">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                          <DebouncedInput
                            type="text"
                            value={filterVal}
                            onChange={val => header.column.setFilterValue(val || undefined)}
                            placeholder="Search…"
                            className="w-full pl-8 pr-8 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors shadow-sm"
                          />
                          {filterVal && (
                            <button
                              onClick={() => header.column.setFilterValue(undefined)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        // Empty placeholder keeps row height consistent
                        <div className="h-[26px]" />
                      )}
                    </th>
                  );
                })}
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </thead>
  );
};

// ─── Inner header cell content ────────────────────────────────────────────────

interface HeaderContentProps<T> {
  header: Header<T, unknown>;
  hasFilter: boolean;
  isSortEnabled: boolean;
  isSorted: false | 'asc' | 'desc';
}

function HeaderContent<T>({ header, hasFilter, isSortEnabled, isSorted }: HeaderContentProps<T>) {
  const def          = header.column.columnDef as { contentAlign?: string };
  const isCentered   = def.contentAlign === 'center';

  return (
    <div className={`flex items-center w-full min-w-0 ${isCentered ? 'justify-center' : 'justify-between gap-x-2'}`}>
      {/* Column label */}
      <span className="truncate text-[11px] uppercase tracking-wider font-bold min-w-0">
        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
      </span>

      {(hasFilter || isSortEnabled) && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Blue dot when a filter is active */}
          {hasFilter && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Filtered" />}

          {/* Sort button — only shown when enabled for this column */}
          {isSortEnabled && (
            <button
              onClick={header.column.getToggleSortingHandler()}
              className={`p-0.5 rounded transition-colors ${
                isSorted ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-purple-500 dark:hover:text-purple-400'
              }`}
              title={isSorted === 'asc' ? 'A→Z · click for Z→A' : isSorted === 'desc' ? 'Z→A · click to clear' : 'Sort column'}
            >
              {isSorted === 'asc'  ? <ChevronUp    className="h-3.5 w-3.5" /> :
               isSorted === 'desc' ? <ChevronDown  className="h-3.5 w-3.5" /> :
                                     <ChevronsUpDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}