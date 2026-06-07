import client from './client'

export const getOrders = (params = {}) =>
  client.get('/api/orders', { params }).then(r => r.data)

export const getOrder = (id) =>
  client.get(`/api/orders/${id}`).then(r => r.data)

export const createOrder = (data) =>
  client.post('/api/orders', data).then(r => r.data)

export const updateOrderStatus = (id, status) =>
  client.patch(`/api/orders/${id}/status`, { status }).then(r => r.data)
