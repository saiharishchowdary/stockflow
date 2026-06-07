import Badge from '../ui/Badge'

const statusConfig = {
  pending: { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'info', label: 'Confirmed' },
  processing: { variant: 'accent', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
}

export default function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || { variant: 'neutral', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
