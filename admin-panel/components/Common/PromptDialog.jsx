import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import './PromptDialog.css';

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
  const portalContainerRef = useRef(null);

  useEffect(() => {
    // Find the shadow root container or use document.body as fallback
    const shadowContainer = document.querySelector('#admin-root') || document.body;
    portalContainerRef.current = shadowContainer;
  }, []);

  const handleConfirm = () => {
    onConfirm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const dialogContent = (
    <div className="prompt-overlay" onClick={onCancel}>
      <div className="prompt-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="prompt-icon-wrapper">
          <div className="prompt-icon">
            <img src="/icon/edit.svg" alt="Prompt" />
          </div>
        </div>
        <h2 className="prompt-title">{title}</h2>
        {message && <p className="prompt-message">{message}</p>}
        <input
          type="text"
          className="prompt-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <div className="prompt-actions">
          <button className="btn-prompt-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-prompt-ok" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  // If we're in Shadow DOM, render directly instead of using portal
  if (portalContainerRef.current && portalContainerRef.current.id === 'admin-root') {
    return dialogContent;
  }

  // Fallback to portal for non-shadow DOM
  return portalContainerRef.current 
    ? createPortal(dialogContent, portalContainerRef.current)
    : dialogContent;
}
