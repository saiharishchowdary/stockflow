import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, RefreshCw } from 'lucide-react'

export default function LowStockAlert({ products = [], onRestock }) {
  const [open, setOpen] = useState(true)
  const count = products.length

  if (!count) return null

  return (
    <div style={{ background: 'var(--warning-dim)', border: '1px solid rgba(243,156,18,0.3)', borderRadius: 'var(--radius-lg)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)',
          fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9375rem',
        }}
      >
        <AlertTriangle size={16} />
        Low Stock Alert ({count} item{count !== 1 ? 's' : ''})
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 14px' }}>
          {products.map((p) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderTop: '1px solid rgba(243,156,18,0.15)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.sku}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: p.stock_quantity === 0 ? 'var(--danger)' : 'var(--warning)', fontSize: '0.875rem' }}>
                    {p.stock_quantity}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>of {p.low_stock_threshold} min</div>
                </div>
                {onRestock && (
                  <button className="btn btn-secondary btn-sm" onClick={() => onRestock(p)}>
                    <RefreshCw size={12} /> Restock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
