/**
 * Global Type Definitions
 * 
 * Extends global types and provides ambient declarations
 */

/// <reference types="vite/client" />

// ============================================================================
// VITE ENV
// ============================================================================

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============================================================================
// CHROME EXTENSION
// ============================================================================

declare namespace chrome {
  namespace runtime {
    const id: string | undefined;
    function sendMessage<T = unknown>(message: unknown): Promise<T>;
    function sendMessage<T = unknown>(
      extensionId: string,
      message: unknown
    ): Promise<T>;
  }
  
  namespace storage {
    namespace local {
      function get<T = Record<string, unknown>>(keys: string | string[]): Promise<T>;
      function set(items: Record<string, unknown>): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
      function clear(): Promise<void>;
    }
    
    namespace sync {
      function get<T = Record<string, unknown>>(keys: string | string[]): Promise<T>;
      function set(items: Record<string, unknown>): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
    }
  }
  
  namespace identity {
    function getAuthToken(options: { interactive: boolean }): Promise<string>;
    function removeCachedAuthToken(options: { token: string }): Promise<void>;
  }
}

// ============================================================================
// CREDENTIAL MANAGEMENT API
// ============================================================================

interface PasswordCredentialData {
  id: string;
  password: string;
  name?: string;
  iconURL?: string;
}

interface PasswordCredential extends Credential {
  readonly password: string;
  readonly name: string;
  readonly iconURL: string;
}

declare var PasswordCredential: {
  prototype: PasswordCredential;
  new(data: PasswordCredentialData): PasswordCredential;
};

interface CredentialRequestOptions {
  password?: boolean;
  federated?: FederatedCredentialRequestOptions;
  mediation?: CredentialMediationRequirement;
}

interface Window {
  PasswordCredential: typeof PasswordCredential;
}

// ============================================================================
// WINDOW EXTENSIONS
// ============================================================================

interface Window {
  modal: {
    show: (options: ModalOptions) => void;
    hide: () => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
  };
  
  toast: {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
  };
}

interface ModalOptions {
  title: string;
  content: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'info' | 'warning' | 'error' | 'confirm';
  closable?: boolean;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract the resolved type of a Promise
 */
type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Function that returns a Promise
 */
type AsyncFunction<T = void, Args extends unknown[] = []> = (...args: Args) => Promise<T>;

/**
 * Event handler type
 */
type EventHandler<E = Event> = (event: E) => void;

/**
 * Nullable type
 */
type Nullable<T> = T | null;

/**
 * Maybe type (nullable or undefined)
 */
type Maybe<T> = T | null | undefined;

// ============================================================================
// REACT EXTENSIONS
// ============================================================================

declare namespace React {
  /**
   * Props with children
   */
  type PropsWithChildren<P = unknown> = P & { children?: React.ReactNode };
  
  /**
   * Component with display name
   */
  type NamedComponent<P = unknown> = React.FC<P> & { displayName?: string };
}

// ============================================================================
// MODULE DECLARATIONS
// ============================================================================

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: Record<string, unknown>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
