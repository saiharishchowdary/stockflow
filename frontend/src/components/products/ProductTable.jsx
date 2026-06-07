import { useState } from 'react'
import { Edit2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import Badge from '../ui/Badge'
import Pagination from '../ui/Pagination'

function formatCurrency(v) {
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export default function ProductTable({ data, onEdit, onDelete, onRestock, page, onPageChange }) {
  const { items = [], total = 0, pages = 1, limit = 20 } = data || {}

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <p>No products found</p>
                  </div>
                </td>
              </tr>
            )}
            {items.map(product => (
              <tr key={product.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  {product.description && (
                    <div className="text-xs text-muted" style={{ marginTop: 2, maxWidth: 240 }}>
                      {product.description.slice(0, 60)}…
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>
                    {product.sku}
                  </span>
                </td>
                <td>{product.category || '—'}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600 }}>{product.stock_quantity}</span>
                    {product.is_low_stock && product.stock_quantity > 0 && (
                      <AlertTriangle size={13} color="var(--warning)" title="Low stock" />
                    )}
                    {product.stock_quantity === 0 && (
                      <Badge variant="danger">Out</Badge>
                    )}
                  </div>
                </td>
                <td>
                  <Badge variant={product.is_active ? 'success' : 'neutral'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {product.is_low_stock && product.stock_quantity > 0 && (
                    <Badge variant="warning" style={{ marginLeft: 4 }}>Low</Badge>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onRestock(product)} title="Restock">
                      <RefreshCw size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(product)} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDelete(product)} title="Delete"
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
