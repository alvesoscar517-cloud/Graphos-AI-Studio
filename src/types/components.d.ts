/**
 * Component Type Definitions
 */

import { ImgHTMLAttributes } from 'react';

// ============================================================================
// ICON COMPONENT
// ============================================================================

export interface IconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  /** Icon name (without .svg extension) */
  name: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color preset */
  color?: 'default' | 'primary' | 'muted' | 'success' | 'warning' | 'error';
  /** Auto invert in dark mode (default: true) */
  themed?: boolean;
}

declare module '../components/Common/Icon' {
  const Icon: React.FC<IconProps>;
  export default Icon;
}

declare module '../components/Common' {
  export const Icon: React.FC<IconProps>;
}
