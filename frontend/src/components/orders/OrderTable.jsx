import { Eye, Trash2 } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import Pagination from '../ui/Pagination'
import { useNavigate } from 'react-router-dom'

function formatCurrency(v) {
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export default function OrderTable({ data, onDelete, page, onPageChange }) {
  const { items = [], total = 0, pages = 1, limit = 20 } = data || {}
  const navigate = useNavigate()

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7}><div className="empty-state"><p>No orders found</p></div></td></tr>
            )}
            {items.map(order => (
              <tr key={order.id}>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    style={{ padding: 0, fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}
                  >
                    {order.order_number}
                  </button>
                </td>
                <td style={{ fontWeight: 500 }}>{order.customer_name || '—'}</td>
                <td className="text-secondary">{order.items?.length || 0} items</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(order.total_amount)}</td>
                <td><OrderStatusBadge status={order.status} /></td>
                <td className="text-secondary text-sm">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/orders/${order.id}`)}>
                      <Eye size={14} />
                    </button>
                    {order.status === 'pending' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => onDelete(order)}
                        style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} total={total} limit={limit} onChange={onPageChange} />
    </div>
  )
}
