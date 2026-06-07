import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useCustomerOrders } from '../hooks/useCustomers'
import { StatusBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SearchBar from '../components/ui/SearchBar'
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Input, { Textarea } from '../components/ui/Input'
import { toast } from '../components/ui/Toast'

function CustomerForm({ initial, onClose }) {
  const isEdit = !!initial
  const create = useCreateCustomer()
  const update = useUpdateCustomer()

  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      if (isEdit) {
        await update.mutateAsync({ id: initial.id, data: form })
        toast.success('Customer updated')
      } else {
        await create.mutateAsync(form)
        toast.success('Customer created')
      }
      onClose()
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string' && detail.toLowerCase().includes('email')) {
        setErrors({ email: 'Email already registered' })
      } else {
        toast.error(detail || 'Failed to save customer')
      }
    }
  }

  const isMutating = create.isPending || update.isPending

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <Input id="cname" label="Full Name" required value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} />
        <Input id="cemail" label="Email" required type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
        <Input id="cphone" label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91-9876543210" />
        <Textarea id="caddr" label="Address" value={form.address} onChange={e => set('address', e.target.value)} rows={3} />
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isMutating}>Cancel</Button>
        <Button type="submit" loading={isMutating}>{isEdit ? 'Save Changes' : 'Add Customer'}</Button>
      </ModalFooter>
    </form>
  )
}

function CustomerOrdersPanel({ customer, onClose }) {
  const { data: ordersResp, isLoading } = useCustomerOrders(customer.id)
  const orders = ordersResp?.items ?? []

  return (
    <Modal isOpen onClose={onClose} title={`${customer.name}'s Orders`} size="lg">
      <ModalBody>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{customer.email} · {customer.phone || 'No phone'}</span>
        </div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner spinner-dark" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p className="empty-state-text">No orders yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{o.order_number}</td>
                    <td style={{ fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontSize: 13 }}>{o.items?.length ?? 0} item(s)</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  )
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailCustomer, setDetailCustomer] = useState(null)

  const { data: customers = [], isLoading } = useCustomers({ search })
  const deleteCustomer = useDeleteCustomer()

  const handleDelete = async () => {
    try {
      await deleteCustomer.mutateAsync(deleteTarget.id)
      toast.success('Customer deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete customer')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Customers</h2>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, email…" />
        </div>
        <Button onClick={() => setModal('create')}><Plus size={16} /> Add Customer</Button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Member Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div className="skeleton skeleton-text" style={{ width: j === 0 ? 120 : 80 }} /></td>
                  ))}
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-state-title">No customers found</div>
                </div>
              </td></tr>
            ) : customers.map(c => (
              <tr key={c.id}>
                <td>
                  <button
                    onClick={() => setDetailCustomer(c)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                  >
                    {c.name} <ChevronRight size={14} />
                  </button>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.email}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.phone || '—'}</td>
                <td style={{ fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'edit', customer: c })}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(c)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add Customer">
        <CustomerForm onClose={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Customer">
        {modal?.type === 'edit' && <CustomerForm initial={modal.customer} onClose={() => setModal(null)} />}
      </Modal>

      {detailCustomer && (
        <CustomerOrdersPanel customer={detailCustomer} onClose={() => setDetailCustomer(null)} />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Delete "${deleteTarget?.name}"? Their orders will be preserved.`}
        isLoading={deleteCustomer.isPending}
      />
    </div>
  )
}
