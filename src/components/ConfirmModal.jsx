import { IoClose } from "react-icons/io5";
import "../styles/confirm-modal.css";

export default function ConfirmModal({
  open,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "Confirm",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-modal-close"
          onClick={onCancel}
          aria-label="Close"
        >
          <IoClose />
        </button>

        <div className="confirm-modal-content">
          <h2>{title}</h2>

          <p>{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-modal-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}