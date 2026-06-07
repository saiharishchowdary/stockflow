import { useState } from 'react'
import { Save } from 'lucide-react'

const defaultForm = {
  name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', is_active: true,
}

export default function CustomerForm({ initial, onSubmit, isPending }) {
  const [form, setForm] = useState(initial || defaultForm)
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = 'Valid email required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label required">Full Name</label>
        <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name}
          onChange={e => set('name', e.target.value)} placeholder="e.g. Priya Sharma" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label required">Email</label>
          <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" value={form.email}
            onChange={e => set('email', e.target.value)} placeholder="priya@example.com" />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+91-9876543210" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea className="form-textarea" style={{ minHeight: 60 }} value={form.address}
          onChange={e => set('address', e.target.value)} placeholder="Street address..." />
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Hyderabad" />
        </div>
        <div className="form-group">
          <label className="form-label">State</label>
          <input className="form-input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Telangana" />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input className="form-input" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="500034" />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <label className="toggle-switch">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isPending}>
        <Save size={15} />
        {isPending ? 'Saving…' : 'Save Customer'}
      </button>
    </form>
  )
}
