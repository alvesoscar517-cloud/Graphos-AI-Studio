/**
 * Data Table component using @tanstack/react-table
 * Supports sorting, filtering, pagination
 */

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * DataTable component
 * @param {object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRowClick - Row click handler
 * @param {boolean} props.selectable - Enable row selection
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {number} props.pageSize - Items per page (default: 20)
 */
export function DataTable({
  columns,
  data = [],
  loading = false,
  onRowClick,
  selectable = false,
  onSelectionChange,
  pageSize = 20,
  className,
  emptyMessage = 'Không có dữ liệu',
}) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Add selection column if selectable
  const tableColumns = useMemo(() => {
    if (!selectable) return columns

    return [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 rounded border-border"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-border"
          />
        ),
        size: 40,
      },
      ...columns,
    ]
  }, [columns, selectable])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      
      if (onSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => data[parseInt(key)])
        onSelectionChange(selectedRows)
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length

  return (
    <div className={cn('w-full', className)}>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-surface-secondary">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'p-3 text-left text-xs font-medium text-muted uppercase tracking-wider',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-primary'
                    )}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-primary">
                          {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={tableColumns.length} className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Đang tải...
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="p-8 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-border transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-secondary',
                    row.getIsSelected() && 'bg-primary/5'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-sm text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-muted">
            {selectable && selectedCount > 0 && (
              <span className="mr-4 font-medium text-primary">
                Đã chọn {selectedCount} mục
              </span>
            )}
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              Đầu
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Cuối
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Helper to create column definitions
 */
export function createColumnHelper() {
  return {
    accessor: (accessorKey, options = {}) => ({
      accessorKey,
      ...options,
    }),
    display: (options) => ({
      ...options,
    }),
  }
}

export default DataTable
