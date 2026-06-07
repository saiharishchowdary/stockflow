import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrders, getOrder, createOrder, updateOrderStatus,
} from '../api/orders'

export const useOrders = (params = {}) =>
  useQuery({ queryKey: ['orders', params], queryFn: () => getOrders(params) })

export const useOrder = (id) =>
  useQuery({ queryKey: ['order', id], queryFn: () => getOrder(id), enabled: !!id })

export const useCreateOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['low-stock'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['low-stock'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
