import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, restockProduct, getCategories,
} from '../api/products'

export const useProducts = (params = {}) =>
  useQuery({ queryKey: ['products', params], queryFn: () => getProducts(params) })

export const useProduct = (id) =>
  useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id), enabled: !!id })

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: getCategories })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export const useRestockProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity, notes }) => restockProduct(id, quantity, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['low-stock'] })
    },
  })
}
