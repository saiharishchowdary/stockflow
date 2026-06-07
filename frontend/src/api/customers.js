import client from './client'

export const getCustomers = (params = {}) =>
  client.get('/api/customers', { params }).then(r => r.data)

export const getCustomer = (id) =>
  client.get(`/api/customers/${id}`).then(r => r.data)

export const createCustomer = (data) =>
  client.post('/api/customers', data).then(r => r.data)

export const updateCustomer = (id, data) =>
  client.put(`/api/customers/${id}`, data).then(r => r.data)

export const deleteCustomer = (id) =>
  client.delete(`/api/customers/${id}`)

export const getCustomerOrders = (id, params = {}) =>
  client.get(`/api/customers/${id}/orders`, { params }).then(r => r.data)
