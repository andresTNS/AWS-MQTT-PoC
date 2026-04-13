'use client'

import useSWR from 'swr'

const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Error fetching data')
  }
  return res.json()
}

const REFRESH_INTERVAL = 5000

export function useDevices() {
  const { data, error, isLoading, mutate } = useSWR('/api/devices', fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
  })

  return {
    devices: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useDeviceLatest(deviceId) {
  const { data, error, isLoading, mutate } = useSWR(
    deviceId ? `/api/devices/${deviceId}/latest` : null,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: true,
    }
  )

  return {
    data: data || null,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useDeviceHistory(deviceId, options = {}) {
  const { limit = 100, startDate, endDate } = options
  
  const params = new URLSearchParams()
  params.set('limit', limit.toString())
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  
  const url = deviceId ? `/api/devices/${deviceId}/history?${params.toString()}` : null
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
  })

  return {
    history: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    mutate,
  }
}
