import { useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/inventory': 'Inventory',
}

export default function Navbar({ onToggleSidebar, onToggleMobile }) {
  const location = useLocation()
  const { user } = useAuth()
  const title = PAGE_TITLES[location.pathname] || 'StockFlow'

  return (
    <header className="topbar">
      <button
        className="btn btn-ghost btn-sm"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <Menu size={20} />
      </button>
      <h1 className="topbar-title" style={{ fontSize: 18 }}>{title}</h1>
      <div className="topbar-actions">
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          {user?.full_name}
        </span>
        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
          {user?.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
