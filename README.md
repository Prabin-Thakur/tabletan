# tabletan

A flexible React table library powered by TanStack Table, with built-in support for pagination, filtering, sorting, selection, virtualization, sticky headers, export, persistence, and more.

## Installation

```bash
npm install tabletan
```

> `tabletan` is published as a library package and exports both `DataTable` and `BasicTable` plus shared types.

## Quick Start

```tsx
import { DataTable, DataTableColumnDef } from 'tabletan';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const columns: DataTableColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    grow: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    contentAlign: 'center',
  },
];

const rows: User[] = [
  { id: '1', name: 'Ava', email: 'ava@example.com', role: 'Admin' },
  { id: '2', name: 'Liam', email: 'liam@example.com', role: 'Editor' },
];

function App() {
  return <DataTable<User> data={rows} columns={columns} />;
}
```

## Exports

```ts
import { DataTable, BasicTable, DataTableColumnDef } from 'tabletan';
```

- `DataTable` — full-featured table component.
- `BasicTable` — simplified table with the most common options exposed.
- `DataTableColumnDef<T>` — column definition type.

## Main Concepts

### Column definition

Use `DataTableColumnDef<T>` instead of raw TanStack `ColumnDef` to access extra layout helpers.

```ts
const columns: DataTableColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 210,
    grow: true,
    contentAlign: 'left',
    verticalAlign: 'center',
    enableDragging: false,
    enableResizing: false,
  },
];
```

### Simple example

```tsx
<DataTable<User> data={rows} columns={columns} />
```

### BasicTable example

```tsx
import { BasicTable } from 'tabletan';

<BasicTable<User>
  data={rows}
  columns={columns}
  enablePagination
  enableGlobalSearch
  enableSelection
  enableVirtualization
/>
```

## Use Cases

### 1. Client-side pagination

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  enablePagination
/>
```

### 2. Server-side pagination

```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

<DataTable<User>
  mode="server"
  data={rows}
  totalRows={500}
  enablePagination
  paginationConfig={{
    manual: true,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    onChange: setPagination,
  }}
/>
```

### 3. Global search

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  enableGlobalSearch
/>
```

### 4. Server-side filtering

```tsx
const [search, setSearch] = useState('');

<DataTable<User>
  mode="server"
  data={rows}
  columns={columns}
  enableGlobalSearch
  filteringConfig={{
    manual: true,
    globalFilter: search,
    onGlobalFilterChange: setSearch,
  }}
/>
```

### 5. Column filters and sorting

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  enableFiltering
  sortingConfig={{ manual: true, state: sorting, onChange: setSorting }}
/>
```

### 6. Row selection

```tsx
const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

<DataTable<User>
  data={rows}
  columns={columns}
  enableSelection
  selectionConfig={{
    mode: 'multi',
    state: rowSelection,
    onChange: setRowSelection,
  }}
/>
```

### 7. Virtualization for large datasets

```tsx
<DataTable<User>
  data={largeRows}
  columns={columns}
  enableVirtualization
  height="600px"
  virtualizationConfig={{ estimateRowHeight: 56, overscan: 5 }}
/>
```

### 8. Sticky header and pinned columns

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  stickyLeft={['select', 'name']}
  stickyRight={['actions']}
  enableStickyHeader
/>
```

### 9. Column resizing and reordering

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  enableColumnResizing
  enableColumnReordering
  onColumnOrderChange={(order) => console.log(order)}
/>
```

### 10. Row expansion

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  enableExpansion
  renderSubComponent={({ row }) => (
    <div className="p-3">Details: {row.original.name}</div>
  )}
/>
```

### 11. Infinite scroll

```tsx
<DataTable<User>
  mode="infinite"
  data={rows}
  columns={columns}
  hasNextPage={hasNextPage}
  onLoadMore={loadMore}
  isFetching={isFetchingNextPage}
/>
```

### 12. Export CSV

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  enableExport
/>
```

### 13. Persistence

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  persistenceKey="users-table"
/>
```

This will automatically save and restore:
- column order
- column visibility
- filters
- sorting

### 14. Custom toolbar actions

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  enableFiltering
  enableExport
  toolbarConfig={{
    customActions: (
      <button className="px-3 py-2 border rounded">Sync</button>
    ),
  }}
/>
```

### 15. Loading, fetching and error states

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  isLoading
  isFetching
  isError={false}
  loadingState={<div>Loading...</div>}
  errorState={<div>Unable to load table</div>}
/>
```

## Styling and custom classes

You can customize many layout classes without changing the core component.

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  className="my-4"
  containerClassName="rounded-2xl border"
  headerClassName="bg-slate-50"
  bodyClassName="divide-y"
  rowClassName={(row) => (row.index % 2 === 0 ? 'bg-white' : 'bg-slate-50')}
  cellClassName={(cell) =>
    cell.column.id === 'role' ? 'font-semibold text-slate-700' : ''
  }
/>
```

## Events

```tsx
<DataTable<User>
  data={rows}
  columns={columns}
  onRowClick={(row) => console.log('row clicked', row.original)}
  onRowDoubleClick={(row) => console.log('double-clicked', row.original)}
/>
```

## Full server-side example

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, DataTableColumnDef, SortingState } from 'tabletan';

const columns: DataTableColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
];

function UsersTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, isFetching } = useQuery(
    ['users', pagination, search, sorting],
    () => fetchUsers({ pagination, search, sorting })
  );

  return (
    <DataTable<User>
      mode="server"
      data={data?.rows ?? []}
      totalRows={data?.total ?? 0}
      isLoading={isLoading}
      isFetching={isFetching}
      columns={columns}
      enablePagination
      paginationConfig={{
        manual: true,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        onChange: setPagination,
      }}
      enableGlobalSearch
      filteringConfig={{
        manual: true,
        globalFilter: search,
        onGlobalFilterChange: (value) => {
          setSearch(value);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        },
      }}
      enableFiltering
      sortingConfig={{
        manual: true,
        state: sorting,
        onChange: setSorting,
      }}
      enableSelection
      enableColumnReordering
      stickyLeft={['select', 'name']}
      persistenceKey="users-table"
    />
  );
}
```

## Notes

- `DataTable` exposes all features and advanced configuration.
- `BasicTable` is a reduced wrapper for everyday scenarios.
- Use `mode="client"` for local data, `mode="server"` for paged server data, and `mode="infinite"` for infinite scroll.
- Use `DataTableColumnDef<T>` to configure custom cell styling, alignment, resizing, and drag behavior.

## License

ISC
