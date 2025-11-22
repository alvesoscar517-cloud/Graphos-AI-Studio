import { createPortal } from 'react-dom';
import { useState } from 'react';
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

  const handleConfirm = () => {
    onConfirm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return createPortal(
    <div className="prompt-overlay" onClick={onCancel}>
      <div className="prompt-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="prompt-icon">
          <img src="/admin/icon/edit.svg" alt="Prompt" />
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
          <button className="btn-secondary btn-prompt-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-primary btn-prompt-ok" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
