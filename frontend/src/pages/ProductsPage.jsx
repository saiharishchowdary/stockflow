import { useState } from 'react'
import { Plus, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useRestockProduct, useCategories } from '../hooks/useProducts'
import { StockBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SearchBar from '../components/ui/SearchBar'
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Input, { Select, Textarea } from '../components/ui/Input'
import { toast } from '../components/ui/Toast'

function ProductForm({ initial, onClose }) {
  const isEdit = !!initial
  const create = useCreateProduct()
  const update = useUpdateProduct()

  const [form, setForm] = useState({
    name: initial?.name || '',
    sku: initial?.sku || '',
    description: initial?.description || '',
    price: initial?.price || '',
    stock_quantity: initial?.stock_quantity ?? 0,
    low_stock_threshold: initial?.low_stock_threshold ?? 10,
    category: initial?.category || '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.sku.trim()) e.sku = 'SKU is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const data = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: initial.id, data })
        toast.success('Product updated successfully')
      } else {
        await create.mutateAsync(data)
        toast.success('Product created successfully')
      }
      onClose()
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string' && detail.toLowerCase().includes('sku')) {
        setErrors({ sku: 'SKU already exists' })
      } else {
        toast.error(detail || 'Failed to save product')
      }
    }
  }

  const isMutating = create.isPending || update.isPending

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <div className="form-grid">
          <Input id="pname" label="Product Name" required value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} />
          <Input id="psku" label="SKU" required value={form.sku} onChange={e => set('sku', e.target.value)} error={errors.sku} placeholder="ELEC-001" />
        </div>
        <div className="form-grid">
          <Input id="pprice" label="Price (₹)" required type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} error={errors.price} />
          <Input id="pcategory" label="Category" value={form.category} onChange={e => set('category', e.target.value)} placeholder="Electronics" />
        </div>
        <div className="form-grid">
          <Input id="pstock" label="Stock Quantity" type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} />
          <Input id="pthreshold" label="Low Stock Threshold" type="number" min="0" value={form.low_stock_threshold} onChange={e => set('low_stock_threshold', e.target.value)} />
        </div>
        <Textarea id="pdesc" label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isMutating}>Cancel</Button>
        <Button type="submit" loading={isMutating}>{isEdit ? 'Save Changes' : 'Add Product'}</Button>
      </ModalFooter>
    </form>
  )
}

function RestockModal({ product, onClose }) {
  const restock = useRestockProduct()
  const [qty, setQty] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!qty || Number(qty) <= 0) return
    try {
      await restock.mutateAsync({ id: product.id, quantity: Number(qty), notes })
      toast.success(`Added ${qty} units to ${product.name}`)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Restock failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          Current stock: <strong>{product.stock_quantity}</strong> units
        </p>
        <Input id="rqty" label="Quantity to Add" required type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 50" />
        <Input id="rnotes" label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for restock" />
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="success" loading={restock.isPending}>Add Stock</Button>
      </ModalFooter>
    </form>
  )
}

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [modal, setModal] = useState(null) // null | 'create' | {product} | 'restock:{product}'
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: products = [], isLoading } = useProducts({
    search, category, low_stock: lowStock || undefined,
  })
  const { data: categories = [] } = useCategories()
  const deleteProduct = useDeleteProduct()

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Products</h2>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or SKU…" />
          <select
            className="form-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)} />
            Low Stock Only
          </label>
        </div>
        <Button onClick={() => setModal('create')}><Plus size={16} /> Add Product</Button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton skeleton-text" style={{ width: j === 0 ? 140 : 80 }} /></td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-title">No products found</div>
                    <p className="empty-state-text">Try adjusting your filters or add a new product</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><code style={{ fontSize: 12, background: 'var(--surface-alt)', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</code></td>
                  <td>{p.category || '—'}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td><StockBadge product={p} /></td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.low_stock_threshold}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'restock', product: p })} title="Restock">
                        <RotateCcw size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'edit', product: p })} title="Edit">
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(p)} title="Delete" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add Product">
        <ProductForm onClose={() => setModal(null)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Product">
        {modal?.type === 'edit' && <ProductForm initial={modal.product} onClose={() => setModal(null)} />}
      </Modal>

      {/* Restock Modal */}
      <Modal isOpen={modal?.type === 'restock'} onClose={() => setModal(null)} title={`Restock — ${modal?.product?.name || ''}`}>
        {modal?.type === 'restock' && <RestockModal product={modal.product} onClose={() => setModal(null)} />}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={deleteProduct.isPending}
      />
    </div>
  )
}
