'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material'
import dynamic from 'next/dynamic'

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

function MapContent({ data, latestData }) {
  useEffect(() => {
    // Fix Leaflet default marker icons
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    }
  }, [])

  const validPositions = useMemo(() => {
    if (!data) return []
    return data
      .filter((r) => r.gps?.latitude != null && r.gps?.longitude != null)
      .map((r) => ({
        lat: r.gps.latitude,
        lng: r.gps.longitude,
        timestamp: r.timestamp,
        temp: r.temperatura_c,
      }))
      .reverse()
  }, [data])

  const center = useMemo(() => {
    if (latestData?.gps?.latitude && latestData?.gps?.longitude) {
      return [latestData.gps.latitude, latestData.gps.longitude]
    }
    if (validPositions.length > 0) {
      const last = validPositions[validPositions.length - 1]
      return [last.lat, last.lng]
    }
    return [-33.4489, -70.6693] // Santiago, Chile
  }, [latestData, validPositions])

  const polylinePositions = validPositions.map((p) => [p.lat, p.lng])

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.7 }}
        />
      )}
      
      {latestData?.gps?.latitude && latestData?.gps?.longitude && (
        <Marker position={[latestData.gps.latitude, latestData.gps.longitude]}>
          <Popup>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {latestData.device_id}
              </Typography>
              <Typography variant="body2">
                Temp: {latestData.temperatura_c?.toFixed(1)}°C
              </Typography>
              <Typography variant="body2">
                Alt: {latestData.gps?.altura?.toFixed(1)} m
              </Typography>
              <Typography variant="body2">
                Vel: {latestData.gps?.speed?.toFixed(1)} km/h
              </Typography>
            </Box>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default function DeviceMap({ data, latestData, isLoading }) {
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Ubicación GPS
          </Typography>
          <Skeleton variant="rectangular" sx={{ flex: 1, minHeight: 350 }} />
        </CardContent>
      </Card>
    )
  }

  const hasValidLocation = latestData?.gps?.latitude != null && latestData?.gps?.longitude != null

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Ubicación GPS
        </Typography>
        {!hasValidLocation && (!data || data.length === 0) ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 350,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              borderRadius: 1,
            }}
          >
            <Typography color="text.secondary">No hay datos de ubicación</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 350 }}>
            <MapContent data={data} latestData={latestData} />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
