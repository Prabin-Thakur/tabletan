import { useMemo } from 'react';
import { DataTableColumnDef } from '../utils/types';
import { Check, Minus } from '../ui/icons';

export interface UseEnhancedColumnsProps<T> {
  columns: DataTableColumnDef<T, any>[];
  enableRowSelection?: boolean;
  enableExpansion?: boolean;
}

export function useEnhancedColumns<T>({
  columns,
  enableRowSelection = false,
  enableExpansion = false,
}: UseEnhancedColumnsProps<T>): DataTableColumnDef<T, any>[] {

  return useMemo(() => {
    const enhancedColumns = [...columns];

    // Add Selection Column
    if (enableRowSelection) {
      const selectionColumn: DataTableColumnDef<T, any> = {
        id: 'select',
        header: ({ table }) => {
          const isAllSelected = table.getIsAllPageRowsSelected();
          const isSomeSelected = table.getIsSomePageRowsSelected();
          
          return (
            <div className="flex items-center justify-center">
              <label className="flex items-center cursor-pointer group">
                <div className={`
                  flex items-center justify-center w-4 h-4 rounded border transition-all duration-200
                  ${isAllSelected 
                    ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200 dark:shadow-blue-900/30' 
                    : isSomeSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-500'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-gray-700'
                  }
                `}>
                  {isAllSelected ? (
                    <Check className="h-3 w-3 text-white animate-in fade-in zoom-in-50 duration-100" strokeWidth={3} />
                  ) : isSomeSelected ? (
                    <Minus className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400 animate-in fade-in duration-100" strokeWidth={3} />
                  ) : null}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isAllSelected}
                  onChange={table.getToggleAllPageRowsSelectedHandler()}
                  aria-label="Select all rows"
                />
              </label>
            </div>
          );
        },
        cell: ({ row }) => {
          const isSelected = row.getIsSelected();
          
          return (
            <div className="flex items-center justify-center">
              <label 
                className="flex items-center cursor-pointer p-1 group"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`
                  flex items-center justify-center w-4 h-4 rounded border transition-all duration-200
                  ${isSelected 
                    ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200 dark:shadow-blue-900/30' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }
                `}>
                  <Check 
                    className={`h-3 w-3 text-white transition-all duration-200 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
                    strokeWidth={3} 
                  />
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isSelected}
                  onChange={row.getToggleSelectedHandler()}
                  aria-label={`Select row ${row.id}`}
                />
              </label>
            </div>
          );
        },
        size: 60,
        enableResizing: false,
        enableHiding: false,
        contentAlign: 'center',
        enableDragging: false,
      };
      enhancedColumns.unshift(selectionColumn);
    }

    // Add Expander Column
    if (enableExpansion) {
      const expanderColumn: DataTableColumnDef<T, any> = {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : null;
        },
        size: 60,
        enableResizing: false,
        enableHiding: false,
        contentAlign: 'center',
        enableDragging: false,
      };
      enhancedColumns.unshift(expanderColumn);
    }

    return enhancedColumns;
  }, [columns, enableRowSelection, enableExpansion]);
}
