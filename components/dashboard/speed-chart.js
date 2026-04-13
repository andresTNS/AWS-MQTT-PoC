'use client'

import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body1" sx={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}: {entry.value?.toFixed(1)} {entry.name === 'Velocidad' ? 'km/h' : 'm'}
          </Typography>
        ))}
      </Box>
    )
  }
  return null
}

export default function SpeedChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Velocidad y Altitud
          </Typography>
          <Skeleton variant="rectangular" height={280} />
        </CardContent>
      </Card>
    )
  }

  const chartData = data
    ?.slice()
    .reverse()
    .map((reading) => ({
      time: format(new Date(reading.timestamp), 'HH:mm', { locale: es }),
      velocidad: reading.gps?.speed || 0,
      altitud: reading.gps?.altura || 0,
    })) || []

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Velocidad y Altitud
        </Typography>
        {chartData.length === 0 ? (
          <Box
            sx={{
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">No hay datos disponibles</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorVelocidad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAltitud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="time"
                stroke="#888"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#3b82f6"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#22c55e"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="velocidad"
                name="Velocidad"
                stroke="#3b82f6"
                fill="url(#colorVelocidad)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="altitud"
                name="Altitud"
                stroke="#22c55e"
                fill="url(#colorAltitud)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
