import { createContext, useContext } from 'react';
import { useNotification } from '../../hooks/useNotification';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import PromptDialog from './PromptDialog';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const notification = useNotification();

  return (
    <NotificationContext.Provider value={notification}>
      {children}
      
      {/* Render toasts */}
      {notification.toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => notification.removeToast(toast.id)}
        />
      ))}
      
      {/* Render confirm dialog */}
      {notification.confirmDialog && (
        <ConfirmDialog 
          open={true}
          onOpenChange={(open) => {
            if (!open) notification.confirmDialog.onCancel?.();
          }}
          {...notification.confirmDialog} 
        />
      )}
      
      {/* Render prompt dialog */}
      {notification.promptDialog && (
        <PromptDialog 
          open={true}
          onOpenChange={(open) => {
            if (!open) notification.promptDialog.onCancel?.();
          }}
          {...notification.promptDialog} 
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotify must be used within NotificationProvider');
  }
  return context;
}
