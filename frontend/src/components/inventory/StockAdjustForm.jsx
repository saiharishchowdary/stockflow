import { useState } from 'react'
import { Save } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'

export default function StockAdjustForm({ onSubmit, isPending }) {
  const [productId, setProductId] = useState('')
  const [quantityChange, setQuantityChange] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const { data } = useProducts({ limit: 100 })
  const products = data?.items || []

  const validate = () => {
    const errs = {}
    if (!productId) errs.productId = 'Select a product'
    if (!quantityChange || quantityChange === '0') errs.quantity = 'Enter a non-zero quantity change'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ product_id: productId, quantity_change: Number(quantityChange), notes })
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label required">Product</label>
        <select className={`form-select ${errors.productId ? 'error' : ''}`} value={productId}
          onChange={e => setProductId(e.target.value)}>
          <option value="">— Select product —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.sku}) — Stock: {p.stock_quantity}</option>
          ))}
        </select>
        {errors.productId && <span className="form-error">{errors.productId}</span>}
      </div>

      <div className="form-group">
        <label className="form-label required">Quantity Change</label>
        <input className={`form-input ${errors.quantity ? 'error' : ''}`} type="number"
          value={quantityChange} onChange={e => setQuantityChange(e.target.value)}
          placeholder="e.g. +50 to add, -10 to remove" />
        {errors.quantity && <span className="form-error">{errors.quantity}</span>}
        <span className="form-error" style={{ color: 'var(--text-muted)' }}>Use negative values to reduce stock</span>
      </div>

      <div className="form-group">
        <label className="form-label">Reason / Notes</label>
        <textarea className="form-textarea" style={{ minHeight: 60 }} value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="Reason for adjustment..." />
      </div>

      <button type="submit" className="btn btn-primary" disabled={isPending}>
        <Save size={15} />
        {isPending ? 'Adjusting…' : 'Apply Adjustment'}
      </button>
    </form>
  )
}
