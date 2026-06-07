import { useParams, useNavigate } from 'react-router-dom'
import { useOrder } from '../../hooks/useOrders'
import { useUpdateOrderStatus } from '../../hooks/useOrders'
import { useToast } from '../ui/Toast'
import OrderStatusBadge from './OrderStatusBadge'
import { ArrowLeft, User, MapPin, Package } from 'lucide-react'

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

function formatCurrency(v) {
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: order, isLoading } = useOrder(id)
  const updateStatus = useUpdateOrderStatus(() => toast('Order status updated', 'success'))

  if (isLoading) return <div className="loading-overlay"><div className="spinner" /></div>
  if (!order) return <div className="empty-state"><p>Order not found</p></div>

  const currentIdx = statusFlow.indexOf(order.status)
  const nextStatus = statusFlow[currentIdx + 1]

  const advance = () => {
    if (nextStatus) updateStatus.mutate({ id: order.id, status: nextStatus })
  }

  const cancel = () => {
    if (order.status !== 'cancelled') {
      updateStatus.mutate({ id: order.id, status: 'cancelled' })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)' }}>
          {order.order_number}
        </h2>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status !== 'cancelled' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Order Progress</div>
          <div className="status-stepper">
            {statusFlow.map((s, idx) => (
              <div key={s} className="step-item">
                <div className={`step-circle ${idx < currentIdx ? 'done' : idx === currentIdx ? 'active' : ''}`}>
                  {idx + 1}
                </div>
                {idx < statusFlow.length - 1 && (
                  <div className={`step-line ${idx < currentIdx ? 'done' : ''}`} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {statusFlow.map(s => (
              <span key={s} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <User size={15} color="var(--accent)" /> Customer
          </div>
          <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
          {order.shipping_address && (
            <div className="text-secondary text-sm" style={{ marginTop: 6, display: 'flex', gap: 4 }}>
              <MapPin size={12} style={{ flexShrink: 0, marginTop: 2 }} /> {order.shipping_address}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Order Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="text-secondary">Items</span>
            <span>{order.items?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="text-secondary">Date</span>
            <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Package size={15} color="var(--accent)" /> Items
        </div>
        <div className="table-wrapper">
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
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{item.product_sku}</span></td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.notes && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Notes</div>
          <p className="text-secondary text-sm">{order.notes}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {nextStatus && order.status !== 'cancelled' && (
          <button className="btn btn-primary" onClick={advance} disabled={updateStatus.isPending}>
            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
          </button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button className="btn btn-danger" onClick={cancel} disabled={updateStatus.isPending}>
            Cancel Order
          </button>
        )}
      </div>
    </div>
  )
}
