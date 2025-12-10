import { createPortal } from 'react-dom';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './index';

export default function PromptDialog({ 
  title, 
  message, 
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel 
}) {
  const [value, setValue] = useState(defaultValue);

  const handleConfirm = () => {
    onConfirm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return createPortal(
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal-nested p-5",
        "animate-fade-in",
        "max-md:p-3 max-md:items-end"
      )}
      onClick={onCancel}
    >
      <div 
        className={cn(
          "bg-bg-secondary rounded-2xl p-8 max-w-modal-sm w-full",
          "shadow-modal text-center",
          "animate-slide-up",
          "max-md:max-w-full max-md:rounded-t-2xl max-md:rounded-b-none max-md:p-5"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5",
          "bg-gradient-to-br from-blue-100 to-blue-200"
        )}>
          <Icon name="edit" size="lg" color="primary" />
        </div>

        {/* Title */}
        <h2 className="m-0 mb-3 text-xl font-bold text-text-primary">
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p className="m-0 mb-5 text-md text-text-muted leading-relaxed">
            {message}
          </p>
        )}

        {/* Input */}
        <input
          type="text"
          className={cn(
            "w-full mb-6 py-3 px-4 text-sm rounded-lg outline-none box-border",
            "border border-border-hover",
            "bg-bg-secondary",
            "text-text-primary",
            "placeholder:text-text-muted",
            "focus:border-accent focus:ring-2 focus:ring-blue-500/20"
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />

        {/* Actions */}
        <div className="flex gap-3 max-md:flex-col-reverse">
          <button 
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer",
              "bg-bg-tertiary text-text-secondary",
              "border-none transition-colors duration-200",
              "hover:bg-bg-hover"
            )}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer",
              "bg-primary text-white border-none",
              "transition-colors duration-200",
              "hover:bg-primary-hover"
            )}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
