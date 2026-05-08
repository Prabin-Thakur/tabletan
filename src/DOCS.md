# DataTable — Usage Guide

Two components: 
**`DataTable`** (all features) 
**`BasicTable`** (pagination, search, selection, virtualization only)

---

## Column Definition

```tsx
import { DataTableColumnDef } from '@/components/Table';

const columns: DataTableColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,               // width in px
    grow: true,              // stretch to fill remaining space
    contentAlign: 'left',   // 'left' | 'center' | 'right'
    verticalAlign: 'center',// 'top' | 'center' | 'bottom'
    enableDragging: false,  // lock from drag-reorder
    enableResizing: false,  // no resize handle
    enableSorting: false,   // no sort for this column
    enableHiding: false,    // can't hide this column & hidden in filter menu
    cell: ({ row }) => <b>{row.original.name}</b>,
  },
];
```

---

## Features

### Pagination

```tsx
// Client-side (table does it all)
<DataTable data={rows} columns={cols} enablePagination />

// Server-side
const [pg, setPg] = useState({ pageIndex: 0, pageSize: 20 });
<DataTable
  mode="server" data={rows} totalRows={500}
  enablePagination
  paginationConfig={{ manual: true, ...pg, onChange: setPg }}
/>
```

### Global Search

```tsx
// Client-side
<DataTable data={rows} columns={cols} enableGlobalSearch />

// Server-side
<DataTable
  mode="server" data={rows}
  enableGlobalSearch
  filteringConfig={{ manual: true, globalFilter, onGlobalFilterChange: setGlobalFilter }}
/>
```

### Per-Column Filters & Sort Buttons

```tsx
// Adds "View" button — users toggle search row + sort per column
<DataTable data={rows} columns={cols} enableFiltering />

// Server-side sort
<DataTable
  mode="server" data={rows} enableFiltering
  sortingConfig={{ manual: true, state: sorting, onChange: setSorting }}
/>
```

### Row Selection

```tsx
// Uncontrolled
<DataTable data={rows} columns={cols} enableSelection />

// Controlled
<DataTable
  enableSelection
  selectionConfig={{ mode: 'multi', state: rowSelection, onChange: setRowSelection }}
/>
```

### Virtualization (large datasets)

```tsx
<DataTable
  data={bigList} columns={cols}
  enableVirtualization
  height="600px"
  virtualizationConfig={{ estimateRowHeight: 56, overscan: 5 }}
/>
```

### Sticky Columns / Header

```tsx
<DataTable
  data={rows} 
  columns={cols}
  stickyLeft={['select', 'name']}  // column IDs
  stickyRight={['actions']}
  enableStickyHeader               // default true
/>
```

### Column Resizing

```tsx
enableColumnResizing={true}  // default — drag column edge to resize
```

### Column Reordering

```tsx
<DataTable
  enableColumnReordering
  onColumnOrderChange={(order) => console.log(order)}
/>
```

### Row Expansion

```tsx
// Custom panel below the row
<DataTable
  renderSubComponent={({ row }) => <div>{row.original.details}</div>}
/>

// Tree rows (data has subRows field)
<DataTable enableExpansion data={tree} columns={cols} />

// Controlled
<DataTable enableExpansion expanded={expanded} onExpandedChange={setExpanded} />
```

### Infinite Scroll

```tsx
<DataTable
  mode="infinite" data={flatRows} columns={cols}
  hasNextPage={hasNextPage}
  onLoadMore={fetchNextPage}
  isFetching={isFetchingNextPage}
/>
```

### Export (CSV)

```tsx
<DataTable enableExport />  // adds Export button, downloads visible+filtered rows
```

### Persistence (IndexedDB)

```tsx
<DataTable persistenceKey="my-table" />
```

Saves: **column order, visibility, which columns have search on, which have sort on.**  

### Toolbar Customisation

```tsx
<DataTable
  enableFiltering
  toolbarConfig={{
    customActions: <MyButton />,   // extra element at the right of toolbar
  }}
/>
```

---

## Loading / Error

```tsx
<DataTable
  isLoading={true}    // shows skeleton rows
  isFetching={true}   // shows inline spinner (non-blocking)
  isError={true}
  error={new Error('Failed')}
  loadingState={<MySpinner />}  // custom loading content
  errorState={<MyError />}      // custom error content
/>
```

---

## Config Objects — Practical Examples

### `paginationConfig`

```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

<DataTable
  mode="server"
  data={rows}
  totalRows={total}
  enablePagination
  paginationConfig={{
    manual: true,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    onChange: (updater) => {
      // TanStack can send either object or updater function
      setPagination(prev => typeof updater === 'function' ? updater(prev) : updater);
    },
  }}
/>
```

### `sortingConfig`

```tsx
const [sorting, setSorting] = useState<SortingState>([]);

<DataTable
  data={rows}
  columns={cols}
  sortingConfig={{
    manual: true, // server sort
    state: sorting,
    onChange: (updater) => {
      setSorting(prev => typeof updater === 'function' ? updater(prev) : updater);
    },
  }}
/>
```

### `filteringConfig` (global + column filters + placeholder)

```tsx
const [globalFilter, setGlobalFilter] = useState('');
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

<DataTable
  mode="server"
  data={rows}
  columns={cols}
  enableGlobalSearch
  enableFiltering
  filteringConfig={{
    manual: true,
    globalFilter,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      setPagination(prev => ({ ...prev, pageIndex: 0 })); // reset page on new search
    },
    columnFilters,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(prev => typeof updater === 'function' ? updater(prev) : updater);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    },
    searchPlaceholder: 'Search products, brand, category...',
  }}
/>
```

### `selectionConfig`

```tsx
const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

<DataTable
  data={rows}
  columns={cols}
  enableSelection
  selectionConfig={{
    mode: 'multi', // 'single' also supported
    state: rowSelection,
    onChange: setRowSelection,
  }}
/>
```

### `virtualizationConfig`

```tsx
<DataTable
  data={rows}
  columns={cols}
  enableVirtualization
  height="500px"
  virtualizationConfig={{
    estimateRowHeight: 52, // approx row px height
    overscan: 8,           // extra rows before/after viewport
  }}
/>
```

### `skeletonConfig`

```tsx
<DataTable
  data={rows}
  columns={cols}
  isLoading
  skeletonConfig={{
    rowCount: 12, // number of loading skeleton rows
  }}
/>
```

### `toolbarConfig`

```tsx
<DataTable
  data={rows}
  columns={cols}
  enableFiltering
  enableExport
  toolbarConfig={{
    customActions: (
      <button className="px-3 py-2 rounded border text-sm">
        Sync
      </button>
    ),
  }}
/>
```

---

## Styling

```tsx
<DataTable
  className="my-4"                    // outer wrapper
  containerClassName="rounded-2xl"    // the card border
  headerClassName="bg-purple-100"     // <thead>
  bodyClassName="divide-y"            // <tbody>
  rowClassName={(row) =>              // per-row
    row.index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
  }
  cellClassName={(cell) =>            // per-cell
    cell.column.id === 'price' ? 'font-bold text-green-700' : ''
  }
/>
```

---

## Events & Misc

```tsx
<DataTable
  onRowClick={(row) => navigate(`/users/${row.original.id}`)}
  onRowDoubleClick={(row) => openModal(row.original)}
  emptyState={<div>No results</div>}
  height="500px"      // fixed scroll height
  maxHeight="600px"   // grows up to this, then scrolls
  aria-label="Users table"
/>
```

---

## Full Server-Side Example

```tsx
const [pg, setPg]       = useState({ pageIndex: 0, pageSize: 20 });
const [search, setSearch] = useState('');
const [sorting, setSorting] = useState<SortingState>([]);

const { data, isLoading, isFetching } = useQuery(
  ['users', pg, search, sorting],
  () => fetchUsers({ pg, search, sorting }),
);

<DataTable<User>
  mode="server"
  data={data?.rows ?? []}
  totalRows={data?.total}
  isLoading={isLoading}
  isFetching={isFetching}
  columns={columns}

  enablePagination
  paginationConfig={{
    manual: true, ...pg,
    onChange: (next) => { setPg(next); },
  }}

  enableGlobalSearch
  filteringConfig={{
    manual: true, globalFilter: search,
    onGlobalFilterChange: (v) => { setPg(p => ({ ...p, pageIndex: 0 })); setSearch(v); },
  }}

  enableFiltering
  sortingConfig={{ manual: true, state: sorting, onChange: setSorting }}

  enableSelection
  enableColumnReordering
  stickyLeft={['select', 'name']}
  persistenceKey="users-table"
/>
```