import { BaseTable } from './BaseTable';
import { DataTableProps } from './utils/types';

export function DataTable<T>(props: DataTableProps<T>) {
  return <BaseTable {...props} />;
}
