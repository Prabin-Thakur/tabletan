// Default configuration
export const DEFAULT_CONFIG = {
  ROW_HEIGHT: 48,
  OVERSCAN: 8,
  PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

// CSS Classes
export const CLASSES = {
  TABLE: 'min-w-full',
  TABLE_CONTAINER: 'relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900',
  HEADER: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold',
  ROW: 'group bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200',
  CELL: 'px-4 py-3 text-sm flex',
  STICKY_BACKGROUND: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/30 transition-colors',
  SCROLLBAR_STYLES: `
    [&::-webkit-scrollbar]:w-[5px]
    [&::-webkit-scrollbar]:h-[5px]
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-track]:dark:bg-gray-800
    [&::-webkit-scrollbar-thumb]:bg-gray-400
    [&::-webkit-scrollbar-thumb]:dark:bg-gray-600
    [&::-webkit-scrollbar-thumb]:rounded
    [&::-webkit-scrollbar-thumb]:hover:bg-gray-500
    [&::-webkit-scrollbar-thumb]:dark:hover:bg-gray-500
    [&::-webkit-scrollbar-corner]:bg-gray-100
    [&::-webkit-scrollbar-corner]:dark:bg-gray-800
    scrollbar-width: thin;
  `
} as const;