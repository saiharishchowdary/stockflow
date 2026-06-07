import { useState } from 'react'
import { Search, Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../hooks/useCustomers'
import { useProducts } from '../../hooks/useProducts'
import { useCreateOrder } from '../../hooks/useOrders'
import { useToast } from '../ui/Toast'

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

function Step1({ selected, onSelect }) {
  const [search, setSearch] = useState('')
  const { data } = useCustomers({ search, limit: 20 })
  const customers = data?.items || []

  return (
    <div>
      <h3 style={{ marginBottom: 14, fontSize: '0.9375rem', fontWeight: 600 }}>Select Customer</h3>
      <div className="search-input-wrapper" style={{ marginBottom: 14 }}>
        <Search size={14} />
        <input className="form-input" placeholder="Search customers…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
        {customers.map((c) => (
          <div key={c.id} onClick={() => onSelect(c)}
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              border: `1px solid ${selected?.id === c.id ? 'var(--accent)' : 'var(--border)'}`,
              background: selected?.id === c.id ? 'var(--accent-dim)' : 'var(--bg-secondary)',
              cursor: 'pointer', transition: 'all var(--transition)',
            }}>
            <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              {c.name}
              {selected?.id === c.id && <CheckCircle2 size={14} color="var(--accent)" />}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
            {c.city && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.city}, {c.state}</div>}
          </div>
        ))}
        {customers.length === 0 && <p className="text-muted text-sm">No customers found</p>}
      </div>
    </div>
  )
}

function Step2({ items, onAdd, onRemove, onQtyChange }) {
  const [search, setSearch] = useState('')
  const { data } = useProducts({ search, limit: 30 })
  const products = data?.items || []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div>
        <h3 style={{ marginBottom: 10, fontSize: '0.9375rem', fontWeight: 600 }}>Available Products</h3>
        <div className="search-input-wrapper" style={{ marginBottom: 10 }}>
          <Search size={14} />
          <input className="form-input" placeholder="Search products…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
          {products.map((p) => {
            const inCart = items.find((i) => i.product_id === p.id)
            return (
              <div key={p.id} style={{
                padding: '8px 12px', borderRadius: 'var(--radius-md)',
                border: `1px solid ${inCart ? 'var(--accent)' : 'var(--border)'}`,
                background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.sku} — Stock: {p.stock_quantity}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>{fmt(p.price)}</div>
                </div>
                <button className="btn btn-primary btn-sm" disabled={p.stock_quantity === 0 || !!inCart}
                  onClick={() => onAdd(p)}>
                  {inCart ? 'Added' : p.stock_quantity === 0 ? 'Out' : <Plus size={13} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: 10, fontSize: '0.9375rem', fontWeight: 600 }}>Selected Items ({items.length})</h3>
        {items.length === 0 ? (
          <div className="empty-state" style={{ height: 100, fontSize: '0.8125rem' }}><p>No items added</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item.product_id} style={{
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'var(--bg-secondary)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{item.name}</div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
                    onClick={() => onRemove(item.product_id)}>×</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => onQtyChange(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <Minus size={11} />
                  </button>
                  <input type="number" min={1} max={item.stock}
                    value={item.quantity}
                    onChange={(e) => onQtyChange(item.product_id, Number(e.target.value))}
                    style={{ width: 60, textAlign: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '4px 6px', fontFamily: 'inherit', fontSize: '0.8125rem' }} />
                  <button className="btn btn-ghost btn-sm" onClick={() => onQtyChange(item.product_id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                    <Plus size={11} />
                  </button>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600 }}>{fmt(item.price * item.quantity)}</span>
                </div>
                {item.quantity > item.stock && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={10} /> Exceeds stock ({item.stock} available)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
            <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1rem' }}>
              Total: {fmt(items.reduce((s, i) => s + i.price * i.quantity, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function Step3({ customer, items, notes, onNotesChange }) {
  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card" style={{ background: 'var(--bg-secondary)', padding: '14px 18px' }}>
        <p className="text-muted text-xs" style={{ marginBottom: 4 }}>Customer</p>
        <p style={{ fontWeight: 600 }}>{customer?.name}</p>
        <p className="text-secondary text-sm">{customer?.email}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th style={{ textAlign: 'right' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product_id}>
              <td style={{ fontWeight: 500 }}>{item.name} <span className="text-muted" style={{ fontSize: '0.75rem' }}>@ {fmt(item.price)}</span></td>
              <td>{item.quantity}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.price * item.quantity)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} style={{ textAlign: 'right', fontWeight: 700, paddingTop: 12 }}>Grand Total</td>
            <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem', paddingTop: 12 }}>{fmt(total)}</td>
          </tr>
        </tbody>
      </table>

      <div className="form-group">
        <label className="form-label">Order Notes (optional)</label>
        <textarea className="form-textarea" value={notes} onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Special instructions, delivery notes…" style={{ minHeight: 72 }} />
      </div>
    </div>
  )
}

export default function OrderForm({ onSuccess }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [customer, setCustomer] = useState(null)
  const [items, setItems] = useState([])
  const [notes, setNotes] = useState('')
  const [stockErrors, setStockErrors] = useState([])

  const createMut = useCreateOrder()

  const addItem = (p) => {
    setItems((prev) => [
      ...prev,
      { product_id: p.id, name: p.name, sku: p.sku, price: Number(p.price), stock: p.stock_quantity, quantity: 1 },
    ])
  }

  const removeItem = (pid) => setItems((prev) => prev.filter((i) => i.product_id !== pid))

  const changeQty = (pid, qty) => {
    if (qty < 1) return
    setItems((prev) => prev.map((i) => i.product_id === pid ? { ...i, quantity: Math.min(qty, i.stock) } : i))
  }

  const hasStockError = items.some((i) => i.quantity > i.stock)

  const submit = async () => {
    setStockErrors([])
    try {
      const order = await createMut.mutateAsync({
        customer_id: customer.id,
        items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
        notes: notes || undefined,
      })
      toast(`Order ${order.order_number} created!`, 'success')
      if (onSuccess) onSuccess()
      navigate(`/orders/${order.id}`)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'object' && detail?.failures) {
        setStockErrors(detail.failures)
        toast('Insufficient stock for some items', 'error')
      } else {
        toast(typeof detail === 'string' ? detail : 'Failed to create order', 'error')
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 24, alignItems: 'center' }}>
        {['Customer', 'Add Items', 'Confirm'].map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className={`step-circle ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.7rem', color: step === i + 1 ? 'var(--accent)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 2 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      {step === 1 && <Step1 selected={customer} onSelect={(c) => { setCustomer(c); setStep(2) }} />}
      {step === 2 && <Step2 items={items} onAdd={addItem} onRemove={removeItem} onQtyChange={changeQty} />}
      {step === 3 && <Step3 customer={customer} items={items} notes={notes} onNotesChange={setNotes} />}

      {stockErrors.length > 0 && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginTop: 14 }}>
          <p style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} /> Stock validation failed
          </p>
          {stockErrors.map((f, i) => (
            <p key={i} className="text-sm" style={{ color: 'var(--danger)' }}>
              {f.product_name} ({f.sku}): requested {f.requested}, available {f.available}
            </p>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 10 }}>
        <button className="btn btn-secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
          ← Back
        </button>
        <div>
          {step < 3 && (
            <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !customer) || (step === 2 && (items.length === 0 || hasStockError))}>
              Next →
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-primary" onClick={submit} disabled={createMut.isPending}>
              {createMut.isPending ? 'Creating…' : '✓ Confirm Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
