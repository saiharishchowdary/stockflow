import { useState } from 'react'
import { Save } from 'lucide-react'

const defaultForm = {
  name: '', sku: '', description: '', price: '', category: '',
  stock_quantity: '', low_stock_threshold: '10', is_active: true,
}

export default function ProductForm({ initial, onSubmit, isPending }) {
  const [form, setForm] = useState(initial || defaultForm)
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const autoSku = () => {
    if (!form.sku && form.name) {
      const slug = form.name.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '').slice(0, 20)
      set('sku', `${slug}-001`)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.sku.trim()) errs.sku = 'SKU is required'
    if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price required'
    if (form.stock_quantity === '' || Number(form.stock_quantity) < 0) errs.stock_quantity = 'Stock must be ≥ 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      low_stock_threshold: Number(form.low_stock_threshold || 10),
    })
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label required">Product Name</label>
        <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name}
          onChange={e => set('name', e.target.value)} onBlur={autoSku} placeholder="e.g. Running Shoes Pro" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label required">SKU</label>
          <input className={`form-input ${errors.sku ? 'error' : ''}`} value={form.sku}
            onChange={e => set('sku', e.target.value.toUpperCase())} placeholder="e.g. SHOE-RUN-001" />
          {errors.sku && <span className="form-error">{errors.sku}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" value={form.category} onChange={e => set('category', e.target.value)}
            placeholder="e.g. Electronics" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Product description..." />
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label required">Price (₹)</label>
          <input className={`form-input ${errors.price ? 'error' : ''}`} type="number" min="0.01" step="0.01"
            value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
          {errors.price && <span className="form-error">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label className="form-label required">Stock Quantity</label>
          <input className={`form-input ${errors.stock_quantity ? 'error' : ''}`} type="number" min="0"
            value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} placeholder="0" />
          {errors.stock_quantity && <span className="form-error">{errors.stock_quantity}</span>}
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Low Stock Threshold</label>
          <input className="form-input" type="number" min="0" value={form.low_stock_threshold}
            onChange={e => set('low_stock_threshold', e.target.value)} />
        </div>
        <div className="form-group" style={{ justifyContent: 'center' }}>
          <label className="form-label">Active</label>
          <label className="toggle-switch">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isPending}>
        <Save size={15} />
        {isPending ? 'Saving…' : 'Save Product'}
      </button>
    </form>
  )
}
