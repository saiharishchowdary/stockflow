import client from './client'

export const getStats = () =>
  client.get('/api/dashboard/stats').then(r => r.data)

export const getRevenueChart = () =>
  client.get('/api/dashboard/revenue-chart').then(r => r.data)

export const getTopProducts = (limit = 5) =>
  client.get('/api/dashboard/top-products', { params: { limit } }).then(r => r.data)
