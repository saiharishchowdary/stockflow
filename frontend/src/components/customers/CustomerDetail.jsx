import { X, Mail, Phone, MapPin, ShoppingCart } from 'lucide-react'
import Badge from '../ui/Badge'
import { useCustomerOrders } from '../../hooks/useCustomers'

function formatCurrency(v) {
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

const statusVariant = {
  pending: 'warning', confirmed: 'info', processing: 'accent',
  shipped: 'info', delivered: 'success', cancelled: 'danger',
}

export default function CustomerDetail({ customer, onClose }) {
  const { data: ordersData, isLoading } = useCustomerOrders(customer?.id)
  const orders = ordersData?.items ?? []

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
          {customer.name[0].toUpperCase()}
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{customer.name}</h3>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            <span className="flex items-center flex-gap-2 text-secondary text-sm">
              <Mail size={13} /> {customer.email}
            </span>
            {customer.phone && (
              <span className="flex items-center flex-gap-2 text-secondary text-sm">
                <Phone size={13} /> {customer.phone}
              </span>
            )}
            {customer.city && (
              <span className="flex items-center flex-gap-2 text-secondary text-sm">
                <MapPin size={13} /> {customer.city}, {customer.state}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ShoppingCart size={16} color="var(--accent)" />
        <span style={{ fontWeight: 600 }}>Order History</span>
        <Badge variant="neutral">{orders.length}</Badge>
      </div>

      {isLoading && <div className="loading-overlay"><div className="spinner" /></div>}

      {!isLoading && orders.length === 0 && (
        <div className="empty-state" style={{ padding: 32 }}>
          <p>No orders yet</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.map(order => (
          <div key={order.id} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent)' }}>
                  {order.order_number}
                </span>
                <span className="text-secondary text-xs" style={{ marginLeft: 8 }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge variant={statusVariant[order.status] || 'neutral'}>{order.status}</Badge>
                <span style={{ fontWeight: 600 }}>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
