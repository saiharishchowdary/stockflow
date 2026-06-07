import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInventoryLogs, adjustInventory, getLowStockProducts } from '../api/inventory'

export const useInventoryLogs = (params = {}) =>
  useQuery({ queryKey: ['inventory', params], queryFn: () => getInventoryLogs(params) })

export const useLowStockProducts = () =>
  useQuery({ queryKey: ['low-stock'], queryFn: getLowStockProducts, staleTime: 15_000 })

export const useAdjustInventory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adjustInventory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['low-stock'] })
    },
  })
}
