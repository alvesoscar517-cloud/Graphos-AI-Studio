/**
 * Virtual List component using react-window
 * For rendering large lists efficiently
 */

import { useRef, useCallback } from 'react'
import { FixedSizeList, VariableSizeList } from 'react-window'
import { cn } from '@/lib/utils'

/**
 * Fixed size virtual list
 * Use when all items have the same height
 */
export function VirtualList({
  items,
  itemHeight = 50,
  height = 400,
  width = '100%',
  renderItem,
  className,
  overscanCount = 5,
}) {
  const Row = useCallback(
    ({ index, style }) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    ),
    [items, renderItem]
  )

  return (
    <div className={cn('virtual-list', className)}>
      <FixedSizeList
        height={height}
        width={width}
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscanCount}
      >
        {Row}
      </FixedSizeList>
    </div>
  )
}

/**
 * Variable size virtual list
 * Use when items have different heights
 */
export function VariableVirtualList({
  items,
  getItemHeight,
  height = 400,
  width = '100%',
  renderItem,
  className,
  overscanCount = 5,
}) {
  const listRef = useRef(null)

  const Row = useCallback(
    ({ index, style }) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    ),
    [items, renderItem]
  )

  const getItemSize = useCallback(
    (index) => getItemHeight(items[index], index),
    [items, getItemHeight]
  )

  return (
    <div className={cn('virtual-list', className)}>
      <VariableSizeList
        ref={listRef}
        height={height}
        width={width}
        itemCount={items.length}
        itemSize={getItemSize}
        overscanCount={overscanCount}
      >
        {Row}
      </VariableSizeList>
    </div>
  )
}

/**
 * Virtual table rows
 * Wrapper for using virtual list in tables
 */
export function VirtualTableBody({
  items,
  rowHeight = 52,
  height = 500,
  renderRow,
  className,
}) {
  return (
    <VirtualList
      items={items}
      itemHeight={rowHeight}
      height={height}
      renderItem={renderRow}
      className={className}
    />
  )
}

export default VirtualList
