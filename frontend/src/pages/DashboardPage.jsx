import {
  Package, Users, ShoppingCart, DollarSign,
  AlertTriangle, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import { useStats, useRevenueChart, useTopProducts } from '../hooks/useDashboard'
import { useLowStockProducts } from '../hooks/useInventory'

function formatCurrency(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toFixed(2)}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{formatDate(label)}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: chart = [] } = useRevenueChart()
  const { data: topProducts = [] } = useTopProducts()
  const { data: lowStock = [] } = useLowStockProducts()

  const statCards = [
    { label: 'Total Products', value: stats?.total_products ?? '—', icon: Package, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Total Customers', value: stats?.total_customers ?? '—', icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Total Orders', value: stats?.total_orders ?? '—', icon: ShoppingCart, color: '#0EA5E9', bg: '#E0F2FE' },
    { label: 'Revenue (Delivered)', value: stats ? formatCurrency(stats.total_revenue) : '—', icon: DollarSign, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Low Stock Items', value: stats?.low_stock_count ?? '—', icon: AlertTriangle, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Pending Orders', value: stats?.pending_orders_count ?? '—', icon: Clock, color: '#DC2626', bg: '#FEE2E2' },
  ]

  return (
    <div>
      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map(c => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Low Stock Warning */}
      {Array.isArray(lowStock) && lowStock.length > 0 && (
        <div className="low-stock-banner">
          <AlertTriangle size={18} />
          <span>
            <strong>{lowStock.length}</strong> product{lowStock.length !== 1 ? 's' : ''} {lowStock.length === 1 ? 'is' : 'are'} low on stock or out of stock.
            Check the <a href="/inventory" style={{ color: '#92400E', textDecoration: 'underline' }}>Inventory</a> page.
          </span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue (Last 7 Days)</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Delivered orders only</span>
          </div>
          <div className="card-body" style={{ paddingBottom: 8 }}>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => formatCurrency(v)}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false} tickLine={false} width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fill="url(#revenue-gradient)"
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Products</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            {topProducts.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <p className="empty-state-text">No sales data yet</p>
              </div>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.product_id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < topProducts.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: i === 0 ? '#FBBF24' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7C2F' : 'var(--surface-alt)',
                    color: i < 3 ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.total_sold} units sold</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                    {formatCurrency(p.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
