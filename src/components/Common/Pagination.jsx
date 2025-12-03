/**
 * Pagination Component
 * Reusable pagination controls
 */

import { cn } from '@/lib/utils'

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = '',
}) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages = []
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let end = Math.min(totalPages, start + maxVisiblePages - 1)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)}>
      {/* First */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'px-2 py-1 text-sm rounded',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-gray-100'
          )}
          aria-label="First page"
        >
          ««
        </button>
      )}

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'px-2 py-1 text-sm rounded',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:bg-gray-100'
        )}
        aria-label="Previous page"
      >
        «
      </button>

      {/* Page numbers */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 text-sm rounded hover:bg-gray-100"
          >
            1
          </button>
          {visiblePages[0] > 2 && <span className="px-2">...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'px-3 py-1 text-sm rounded',
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100'
          )}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 text-sm rounded hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'px-2 py-1 text-sm rounded',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:bg-gray-100'
        )}
        aria-label="Next page"
      >
        »
      </button>

      {/* Last */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'px-2 py-1 text-sm rounded',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-gray-100'
          )}
          aria-label="Last page"
        >
          »»
        </button>
      )}
    </nav>
  )
}

export default Pagination
