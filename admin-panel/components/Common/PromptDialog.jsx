import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function PromptDialog({ 
  title, 
  message, 
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  open = true,
  onOpenChange,
  onConfirm, 
  onCancel 
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    // Auto focus input when dialog opens
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm?.(value);
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-info/10 text-info">
            <img src="/icon/edit.svg" alt="" className="w-6 h-6" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          {message && <DialogDescription>{message}</DialogDescription>}
        </DialogHeader>
        
        <div className="mt-4">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-border/50 bg-surface-secondary text-primary placeholder:text-muted focus:outline-none focus:bg-surface transition-colors"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <DialogFooter className="sm:justify-center gap-3 mt-4">
          <Button variant="secondary" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
