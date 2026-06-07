import { Edit2, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'
import Pagination from '../ui/Pagination'

export default function CustomerTable({ data, onEdit, onDelete, onViewDetail, page, onPageChange }) {
  const { items = [], total = 0, pages = 1, limit = 20 } = data || {}

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state"><p>No customers found</p></div></td></tr>
            )}
            {items.map(customer => (
              <tr key={customer.id}>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onViewDetail(customer)}
                    style={{ padding: 0, fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    {customer.name}
                  </button>
                </td>
                <td className="text-secondary">{customer.email}</td>
                <td className="text-secondary">{customer.phone || '—'}</td>
                <td>{customer.city || '—'}</td>
                <td>
                  <Badge variant={customer.is_active ? 'success' : 'neutral'}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(customer)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDelete(customer)}
                      style={{ color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
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
