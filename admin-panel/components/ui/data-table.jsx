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
      {/* Table - Responsive */}
      <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-border/40 bg-surface">
        <table className="w-full min-w-[500px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/40 bg-surface-secondary/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-3 sm:px-4 py-2.5 sm:py-3.5 text-left text-[10px] sm:text-[12px] font-semibold text-secondary uppercase tracking-[0.02em] whitespace-nowrap',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-primary transition-colors duration-150'
                    )}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-info">
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
                <td colSpan={tableColumns.length} className="p-8 sm:p-10 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-muted">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[13px] sm:text-[15px]">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="p-8 sm:p-10 text-center text-muted text-[13px] sm:text-[15px]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-border/30 transition-all duration-150',
                    onRowClick && 'cursor-pointer hover:bg-surface-secondary/60',
                    row.getIsSelected() && 'bg-info/5'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-[12px] sm:text-[14px] text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Responsive */}
      {table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-5 px-1">
          <div className="text-[12px] sm:text-[14px] text-muted text-center sm:text-left">
            {selectable && selectedCount > 0 && (
              <span className="mr-3 sm:mr-4 font-medium text-primary">
                Đã chọn {selectedCount}
              </span>
            )}
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Đầu</span>
              <span className="sm:hidden">«</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Trước</span>
              <span className="sm:hidden">‹</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Sau</span>
              <span className="sm:hidden">›</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Cuối</span>
              <span className="sm:hidden">»</span>
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
