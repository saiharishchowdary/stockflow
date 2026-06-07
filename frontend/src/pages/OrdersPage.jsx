import { useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { useOrders, useCreateOrder, useUpdateOrderStatus } from '../hooks/useOrders'
import { useCustomers } from '../hooks/useCustomers'
import { useProducts } from '../hooks/useProducts'
import { StatusBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal'
import Input, { Select, Textarea } from '../components/ui/Input'
import { toast } from '../components/ui/Toast'

const STATUSES = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const STATUS_LABELS = { '': 'All', pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
const NEXT_STATUSES = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

function OrderForm({ onClose }) {
  const create = useCreateOrder()
  const { data: customers = [] } = useCustomers()
  const { data: products = [] } = useProducts()

  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [errors, setErrors] = useState({})
  const [stockErrors, setStockErrors] = useState([])

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, ii) => ii !== idx))
  const setItem = (idx, k, v) => setItems(i => i.map((item, ii) => ii === idx ? { ...item, [k]: v } : item))

  const getProduct = (id) => products.find(p => p.id === Number(id))

  const orderTotal = items.reduce((sum, item) => {
    const p = getProduct(item.product_id)
    return sum + (p ? Number(p.price) * Number(item.quantity || 0) : 0)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStockErrors([])
    const errs = {}
    if (!customerId) errs.customer = 'Please select a customer'
    const validItems = items.filter(i => i.product_id && Number(i.quantity) > 0)
    if (validItems.length === 0) errs.items = 'Add at least one product'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await create.mutateAsync({
        customer_id: Number(customerId),
        items: validItems.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
        notes: notes || undefined,
      })
      toast.success('Order created successfully!')
      onClose()
    } catch (err) {
      const data = err?.response?.data
      if (data?.detail?.failures) {
        setStockErrors(data.detail.failures)
        toast.error('Insufficient stock for some items')
      } else {
        toast.error(data?.detail || 'Failed to create order')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <Select id="ocust" label="Customer" required value={customerId} onChange={e => { setCustomerId(e.target.value); setErrors(er => ({ ...er, customer: '' })) }} error={errors.customer}>
          <option value="">— Select customer —</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
        </Select>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label">Order Items</label>
            <Button type="button" size="sm" variant="secondary" onClick={addItem}><Plus size={12} /> Add Item</Button>
          </div>
          {errors.items && <span className="form-error">{errors.items}</span>}
          <div className="order-items-list">
            {items.map((item, idx) => {
              const p = getProduct(item.product_id)
              return (
                <div key={idx} className="order-item-row">
                  <Select
                    id={`item-product-${idx}`}
                    value={item.product_id}
                    onChange={e => setItem(idx, 'product_id', e.target.value)}
                  >
                    <option value="">— Product —</option>
                    {products.map(pr => (
                      <option key={pr.id} value={pr.id} disabled={pr.stock_quantity === 0}>
                        {pr.name} (Stock: {pr.stock_quantity}) — ₹{Number(pr.price).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </Select>
                  <Input
                    id={`item-qty-${idx}`}
                    type="number"
                    min="1"
                    max={p?.stock_quantity || 9999}
                    value={item.quantity}
                    onChange={e => setItem(idx, 'quantity', e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    style={{ color: 'var(--danger)' }}
                  >×</Button>
                </div>
              )
            })}
          </div>
          {items.some(i => i.product_id) && (
            <div className="order-total">
              <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Order Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {stockErrors.length > 0 && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 600, color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>Insufficient stock:</p>
            {stockErrors.map(f => (
              <p key={f.product_id} style={{ fontSize: 12, color: 'var(--danger)' }}>
                SKU {f.sku}: requested {f.requested}, available {f.available}
              </p>
            ))}
          </div>
        )}

        <Textarea id="onotes" label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={create.isPending}>Place Order</Button>
      </ModalFooter>
    </form>
  )
}

function OrderDetailModal({ order, onClose }) {
  const updateStatus = useUpdateOrderStatus()

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status: newStatus })
      toast.success(`Order ${newStatus}`)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update status')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`Order ${order.order_number}`} size="lg">
      <ModalBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</p>
            <p style={{ fontWeight: 600, marginTop: 2 }}>{order.customer_name || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</p>
            <div style={{ marginTop: 4 }}><StatusBadge status={order.status} /></div>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</p>
            <p style={{ fontWeight: 500, marginTop: 2, fontSize: 13 }}>{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</p>
            <p style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginBottom: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.product_name || '—'}</td>
                  <td><code style={{ fontSize: 11, background: 'var(--surface-alt)', padding: '2px 6px', borderRadius: 4 }}>{item.product_sku || '—'}</code></td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.notes && (
          <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            <strong>Notes:</strong> {order.notes}
          </div>
        )}

        {NEXT_STATUSES[order.status]?.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Update Status:</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {NEXT_STATUSES[order.status].map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === 'cancelled' ? 'danger' : 'primary'}
                  loading={updateStatus.isPending}
                  onClick={() => handleStatusChange(s)}
                >
                  Mark {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  )
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data: ordersResp, isLoading } = useOrders({ status: statusFilter || undefined })
  const orders = ordersResp?.items ?? []

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left" style={{ flexWrap: 'wrap' }}>
          <h2 className="page-title">Orders</h2>
          <div className="filter-tabs">
            {STATUSES.map(s => (
              <button
                key={s || 'all'}
                className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus size={16} /> New Order</Button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton skeleton-text" style={{ width: j === 0 ? 130 : 70 }} /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-state-title">No orders found</div>
                  <p className="empty-state-text">Create your first order to get started</p>
                </div>
              </td></tr>
            ) : orders.map(o => (
              <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                <td><code style={{ fontSize: 12, fontWeight: 700 }}>{o.order_number}</code></td>
                <td style={{ fontWeight: 500 }}>{o.customer_name || '—'}</td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                <td style={{ fontSize: 13 }}>{o.items?.length ?? 0}</td>
                <td style={{ fontWeight: 700 }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedOrder(o) }}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Order" size="lg">
        <OrderForm onClose={() => setCreateOpen(false)} />
      </Modal>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}
