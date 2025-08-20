import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "default" | "danger" | "warning";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "确定",
  cancelText = "取消",
  type = "default",
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter") {
      onConfirm();
    }
  };

  return (
    <div 
      className="modal-overlay confirm-dialog-overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`modal-dialog confirm-dialog ${type}`}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        
        <div className="modal-body">
          <div className="confirm-message">
            {message.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <div className="button-group">
            <button 
              className="btn secondary" 
              onClick={onCancel}
              autoFocus={type === "default"}
            >
              {cancelText}
            </button>
            <button 
              className={`btn ${type === "danger" ? "danger" : type === "warning" ? "warning" : "primary"}`}
              onClick={onConfirm}
              autoFocus={type !== "default"}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};