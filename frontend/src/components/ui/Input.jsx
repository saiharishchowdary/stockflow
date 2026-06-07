export default function Input({
  label,
  error,
  required,
  id,
  className = '',
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export function Select({ label, error, required, id, children, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`form-select ${error ? 'error' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, required, id, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`form-textarea ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
