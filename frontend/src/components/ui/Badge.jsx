export default function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const variants = {
    pending: 'pending',
    confirmed: 'confirmed',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
  }
  return <Badge variant={variants[status] || 'neutral'}>{status}</Badge>
}

export function StockBadge({ product }) {
  if (product.stock_quantity === 0)
    return <Badge variant="out">Out of Stock</Badge>
  if (product.is_low_stock)
    return <Badge variant="low-stock">Low Stock ({product.stock_quantity})</Badge>
  return <Badge variant="ok">{product.stock_quantity} in stock</Badge>
}

export function ChangeTypeBadge({ type }) {
  const map = {
    sale: 'sale',
    restock: 'restock',
    adjustment: 'adjustment',
    cancellation: 'cancellation',
  }
  return <Badge variant={map[type] || 'neutral'}>{type}</Badge>
}
