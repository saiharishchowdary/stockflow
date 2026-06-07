import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  BarChart3, Boxes, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLowStockProducts } from '../hooks/useInventory'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: BarChart3, showBadge: true },
]

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const { data: lowStock = [] } = useLowStockProducts()
  const lowCount = Array.isArray(lowStock) ? lowStock.length : 0

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Boxes size={18} />
        </div>
        {!collapsed && (
          <div>
            <div className="brand-name">StockFlow</div>
            <div className="brand-sub">Inventory OS</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon, end, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
            onClick={onCloseMobile}
          >
            <span className="nav-icon" style={{ position: 'relative' }}>
              <Icon size={18} />
              {showBadge && lowCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#DC2626', color: 'white',
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 10, padding: '1px 5px',
                  minWidth: 16, textAlign: 'center',
                }}>
                  {lowCount > 99 ? '99+' : lowCount}
                </span>
              )}
            </span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="user-info">
            <div className="user-avatar">{user.full_name?.[0]?.toUpperCase() || 'U'}</div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name">{user.full_name}</div>
              <div className="user-role">{user.is_admin ? 'Admin' : 'Staff'}</div>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={logout} title={collapsed ? 'Logout' : undefined}>
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
