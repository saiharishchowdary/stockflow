export default function StatCard({ label, value, icon: Icon, color = '#2563EB', bg = '#EFF6FF', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: bg }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend !== undefined && (
          <div style={{ fontSize: 12, marginTop: 4, color: trend >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  )
}
