import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal, { ModalBody, ModalFooter } from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <ModalBody>
        <div className="confirm-body">
          <div className="confirm-icon">
            <Trash2 size={24} />
          </div>
          <div className="confirm-title">{title}</div>
          <p className="confirm-text">{message}</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={isLoading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
