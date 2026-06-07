import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCustomers, getCustomer, createCustomer,
  updateCustomer, deleteCustomer, getCustomerOrders,
} from '../api/customers'

export const useCustomers = (params = {}) =>
  useQuery({ queryKey: ['customers', params], queryFn: () => getCustomers(params) })

export const useCustomer = (id) =>
  useQuery({ queryKey: ['customer', id], queryFn: () => getCustomer(id), enabled: !!id })

export const useCustomerOrders = (id, params = {}) =>
  useQuery({
    queryKey: ['customer-orders', id, params],
    queryFn: () => getCustomerOrders(id, params),
    enabled: !!id,
  })

export const useCreateCustomer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export const useUpdateCustomer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export const useDeleteCustomer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })
}
