'use client'

import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import HeightIcon from '@mui/icons-material/Height'
import SpeedIcon from '@mui/icons-material/Speed'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function StatCard({ title, value, unit, icon, color, isLoading }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {isLoading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
                {value}
                {unit && (
                  <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                    {unit}
                  </Typography>
                )}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function StatsCards({ data, isLoading }) {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      return format(new Date(timestamp), "dd MMM HH:mm:ss", { locale: es })
    } catch {
      return 'N/A'
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Temperatura"
          value={data?.temperatura_c?.toFixed(1) || '--'}
          unit="°C"
          icon={<ThermostatIcon />}
          color="#f59e0b"
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Altitud"
          value={data?.gps?.altura?.toFixed(1) || '--'}
          unit="m"
          icon={<HeightIcon />}
          color="#22c55e"
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Velocidad"
          value={data?.gps?.speed?.toFixed(1) || '--'}
          unit="km/h"
          icon={<SpeedIcon />}
          color="#3b82f6"
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Última Actualización"
          value={formatTimestamp(data?.timestamp)}
          icon={<AccessTimeIcon />}
          color="#a855f7"
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  )
}
