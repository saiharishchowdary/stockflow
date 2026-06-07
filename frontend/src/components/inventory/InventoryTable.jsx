import Pagination from '../ui/Pagination'
import Badge from '../ui/Badge'

const movementVariant = {
  purchase: 'success', sale: 'danger', adjustment: 'accent', return: 'info',
}

export default function InventoryTable({ data, page, onPageChange }) {
  const { items = [], total = 0, pages = 1, limit = 20 } = data || {}

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Change</th>
              <th>Before</th>
              <th>After</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7}><div className="empty-state"><p>No movements found</p></div></td></tr>
            )}
            {items.map(log => (
              <tr key={log.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{log.product_name || '—'}</div>
                  <div className="text-xs text-muted" style={{ fontFamily: 'monospace' }}>{log.product_sku}</div>
                </td>
                <td>
                  <Badge variant={movementVariant[log.movement_type] || 'neutral'}>
                    {log.movement_type}
                  </Badge>
                </td>
                <td style={{ fontWeight: 700, color: log.quantity_change > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                </td>
                <td className="text-secondary">{log.quantity_before}</td>
                <td style={{ fontWeight: 600 }}>{log.quantity_after}</td>
                <td>
                  {log.reference_id
                    ? <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{log.reference_id}</span>
                    : '—'}
                </td>
                <td className="text-secondary text-sm">
                  {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
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
