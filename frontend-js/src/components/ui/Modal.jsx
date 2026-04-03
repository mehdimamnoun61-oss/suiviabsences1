import { useEffect, useRef } from "react"

/**
 * Modal — generic overlay modal
 * variant: "default" | "danger"
 */
export function Modal({ open, onClose, title, children, footer, variant = "default", size = "md" }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onClose?.() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className="ui-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={ref}
        className={`ui-modal ui-modal-${size} ui-modal-${variant}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="ui-modal-header">
            {variant === "danger" && (
              <div className="ui-modal-danger-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            )}
            <h3 id="modal-title" className="ui-modal-title">{title}</h3>
            <button className="ui-modal-close" onClick={onClose} aria-label="Fermer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
        <div className="ui-modal-body">{children}</div>
        {footer && <div className="ui-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/**
 * ConfirmModal — quick delete/action confirmation
 */
export function ConfirmModal({ open, onClose, onConfirm, title = "Confirmer la suppression", message = "Cette action est irréversible. Voulez-vous continuer ?" }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      variant="danger"
      size="sm"
      footer={
        <div className="ui-modal-actions">
          <button className="ui-btn ui-btn-secondary ui-btn-md" onClick={onClose}>Annuler</button>
          <button className="ui-btn ui-btn-danger ui-btn-md" onClick={() => { onConfirm?.(); onClose?.() }}>
            Supprimer
          </button>
        </div>
      }
    >
      <p className="ui-modal-text">{message}</p>
    </Modal>
  )
}

export default Modal
