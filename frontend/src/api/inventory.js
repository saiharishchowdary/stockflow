import client from './client'

export const getInventoryLogs = (params = {}) =>
  client.get('/api/inventory', { params }).then(r => r.data)

export const adjustInventory = (data) =>
  client.post('/api/inventory/adjust', data).then(r => r.data)

export const getLowStockProducts = () =>
  client.get('/api/inventory/low-stock').then(r => r.data)
