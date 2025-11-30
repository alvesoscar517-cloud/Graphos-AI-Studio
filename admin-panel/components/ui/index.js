/**
 * UI Components barrel export
 * Import all UI components from this file
 */

// Core components
export { Button, buttonVariants } from './button'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
export { Input } from './input'
export { Select } from './select'
export { Badge, StatusBadge } from './badge'
export { default as Spinner } from './spinner'

// Data display
export { DataTable, createColumnHelper } from './data-table'
export { VirtualList, VariableVirtualList, VirtualTableBody } from './virtual-list'

// Charts
export {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  SparkLine,
  COLORS as ChartColors,
  CHART_COLORS,
} from './charts'

// Feedback
export { ToastProvider, showToast, toast } from './toast'

// Dialog/Modal
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  ConfirmDialog,
  AlertDialog,
} from './dialog'

// Dropdown Menu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
} from './dropdown-menu'

// Tooltip
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
} from './tooltip'

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

// Date Picker
export { Calendar, DatePicker, DateRangePicker } from './date-picker'

// Skeleton Loading
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonStatsCard,
  SkeletonChart,
  SkeletonListItem,
  SkeletonForm,
} from './skeleton'

// Error Boundary
export {
  ErrorBoundary,
  PageErrorBoundary,
  ErrorFallback,
  PageErrorFallback,
} from './error-boundary'

// Switch
export { Switch, SwitchWithLabel } from './switch'

// Checkbox
export { Checkbox, CheckboxWithLabel } from './checkbox'

// Avatar
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  SimpleAvatar,
  AvatarGroup,
  getInitials,
} from './avatar'

// Progress
export { Progress, ProgressWithLabel, CircularProgress } from './progress'

// Popover
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  SimplePopover,
} from './popover'

// Radix Select (styled)
export {
  Select as RadixSelect,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select-radix'

// Breadcrumb
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  SimpleBreadcrumb,
} from './breadcrumb'

// Pagination
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  SimplePagination,
  CompactPagination,
} from './pagination'
