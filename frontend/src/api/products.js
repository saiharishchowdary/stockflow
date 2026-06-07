import client from './client'

export const getProducts = (params = {}) =>
  client.get('/api/products', { params }).then(r => r.data)

export const getProduct = (id) =>
  client.get(`/api/products/${id}`).then(r => r.data)

export const createProduct = (data) =>
  client.post('/api/products', data).then(r => r.data)

export const updateProduct = (id, data) =>
  client.put(`/api/products/${id}`, data).then(r => r.data)

export const deleteProduct = (id) =>
  client.delete(`/api/products/${id}`)

export const restockProduct = (id, quantity, notes) =>
  client.post(`/api/products/${id}/restock`, { quantity, notes }).then(r => r.data)

export const getCategories = () =>
  client.get('/api/products/categories').then(r => r.data)

export const getLowStockProducts = () =>
  client.get('/api/inventory/low-stock').then(r => r.data)
