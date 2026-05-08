import { TableContainer, Table } from './Table';
import { CLASSES } from '../utils/constants';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showHeader?: boolean;
  className?: string;
}

/**
 * Skeleton loader for the table
 * Shows when data is loading (headers remain visible)
 */
export const TableSkeleton = ({
  columns,
  rows = 10,
  showHeader = true,
  className,
}: TableSkeletonProps) => {
  return (
    <TableContainer className={className}>
      <Table>
        {/* Header skeleton */}
        {showHeader && (
          <thead className={CLASSES.HEADER}>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className={`${CLASSES.CELL} border-r last:border-r-0`}>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Body skeleton */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className={CLASSES.ROW}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className={`${CLASSES.CELL} border-r last:border-r-0`}>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};