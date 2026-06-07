import { useQuery } from '@tanstack/react-query'
import { getStats, getRevenueChart, getTopProducts } from '../api/dashboard'

export const useStats = () =>
  useQuery({ queryKey: ['stats'], queryFn: getStats, staleTime: 60_000 })

export const useRevenueChart = () =>
  useQuery({ queryKey: ['revenue-chart'], queryFn: getRevenueChart, staleTime: 60_000 })

export const useTopProducts = (limit = 5) =>
  useQuery({ queryKey: ['top-products', limit], queryFn: () => getTopProducts(limit), staleTime: 60_000 })
