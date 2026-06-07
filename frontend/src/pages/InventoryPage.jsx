import { useState } from 'react'
import { AlertTriangle, SlidersHorizontal } from 'lucide-react'
import { useInventoryLogs, useLowStockProducts, useAdjustInventory } from '../hooks/useInventory'
import { useProducts } from '../hooks/useProducts'
import { ChangeTypeBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal'
import Input, { Select, Textarea } from '../components/ui/Input'
import Pagination from '../components/ui/Pagination'
import { toast } from '../components/ui/Toast'

function AdjustForm({ onClose }) {
  const adjust = useAdjustInventory()
  const { data: products = [] } = useProducts()
  const [productId, setProductId] = useState('')
  const [quantityChanged, setQuantityChanged] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!productId) errs.product = 'Select a product'
    if (!quantityChanged || quantityChanged === '0') errs.qty = 'Enter a non-zero quantity'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await adjust.mutateAsync({
        product_id: Number(productId),
        quantity_changed: Number(quantityChanged),
        notes: notes || undefined,
      })
      toast.success('Stock adjusted successfully')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Adjustment failed')
    }
  }

  const selectedProduct = products.find(p => p.id === Number(productId))

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <Select
          id="adj-product"
          label="Product"
          required
          value={productId}
          onChange={e => { setProductId(e.target.value); setErrors(er => ({ ...er, product: '' })) }}
          error={errors.product}
        >
          <option value="">— Select product —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (SKU: {p.sku}, Stock: {p.stock_quantity})
            </option>
          ))}
        </Select>

        {selectedProduct && (
          <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            Current stock: <strong style={{ color: 'var(--text)' }}>{selectedProduct.stock_quantity}</strong> units
          </div>
        )}

        <Input
          id="adj-qty"
          label="Quantity Change"
          required
          type="number"
          value={quantityChanged}
          onChange={e => { setQuantityChanged(e.target.value); setErrors(er => ({ ...er, qty: '' })) }}
          error={errors.qty}
          placeholder="Positive to add, negative to remove (e.g. -5 or +20)"
        />

        <Input
          id="adj-notes"
          label="Reason / Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Reason for adjustment"
        />
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={adjust.isPending}>Apply Adjustment</Button>
      </ModalFooter>
    </form>
  )
}

export default function InventoryPage() {
  const [page, setPage] = useState(1)
  const [productFilter, setProductFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [adjustOpen, setAdjustOpen] = useState(false)

  const { data: logsResp, isLoading } = useInventoryLogs({
    page,
    product_id: productFilter || undefined,
    change_type: typeFilter || undefined,
  })
  const { data: lowStock = [] } = useLowStockProducts()
  const { data: products = [] } = useProducts()

  const logs = logsResp?.items ?? []
  const totalPages = logsResp?.pages ?? 1

  const CHANGE_TYPES = ['', 'sale', 'restock', 'adjustment', 'cancellation']

  return (
    <div>
      {/* Low Stock Section */}
      {Array.isArray(lowStock) && lowStock.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="low-stock-banner">
            <AlertTriangle size={18} />
            <span>
              <strong>{lowStock.length}</strong> product{lowStock.length !== 1 ? 's' : ''} need{lowStock.length === 1 ? 's' : ''} attention
            </span>
          </div>
          <div className="low-stock-grid">
            {lowStock.map(p => (
              <div key={p.id} className={`low-stock-card ${p.stock_quantity === 0 ? 'out-of-stock' : ''}`}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: p.stock_quantity === 0 ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <AlertTriangle size={16} color={p.stock_quantity === 0 ? 'var(--danger)' : 'var(--warning)'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.stock_quantity === 0 ? 'OUT OF STOCK' : `${p.stock_quantity} left (min: ${p.low_stock_threshold})`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Log */}
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Inventory Log</h2>
          <select
            className="form-select"
            value={productFilter}
            onChange={e => { setProductFilter(e.target.value); setPage(1) }}
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            className="form-select"
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            style={{ width: 'auto', minWidth: 130 }}
          >
            {CHANGE_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
        </div>
        <Button onClick={() => setAdjustOpen(true)}><SlidersHorizontal size={16} /> Adjust Stock</Button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Before</th>
              <th>Change</th>
              <th>After</th>
              <th>Reference</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton skeleton-text" style={{ width: j === 1 ? 120 : 60 }} /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-state-title">No inventory logs</div>
                  <p className="empty-state-text">Stock changes will appear here</p>
                </div>
              </td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{log.product_name || '—'}</div>
                  {log.product_sku && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.product_sku}</div>}
                </td>
                <td><ChangeTypeBadge type={log.change_type} /></td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{log.quantity_before}</td>
                <td>
                  <span style={{
                    fontWeight: 700, fontSize: 13,
                    color: log.quantity_changed > 0 ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed}
                  </span>
                </td>
                <td style={{ fontSize: 13, fontWeight: 600 }}>{log.quantity_after}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {log.reference_id ? `ORD #${log.reference_id}` : '—'}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.notes || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={totalPages} onPage={setPage} />

      <Modal isOpen={adjustOpen} onClose={() => setAdjustOpen(false)} title="Adjust Stock">
        <AdjustForm onClose={() => setAdjustOpen(false)} />
      </Modal>
    </div>
  )
}
