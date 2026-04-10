'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Grid,
  Alert,
  Chip,
} from '@mui/material'
import RouterIcon from '@mui/icons-material/Router'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import { useDevices, useDeviceLatest, useDeviceHistory } from '@/hooks/use-device-data'
import DeviceSelector from '@/components/dashboard/device-selector'
import StatsCards from '@/components/dashboard/stats-cards'
import TemperatureChart from '@/components/dashboard/temperature-chart'
import SpeedChart from '@/components/dashboard/speed-chart'
import DataTable from '@/components/dashboard/data-table'
import DeviceMap from '@/components/dashboard/device-map'

export default function Dashboard() {
  const [selectedDevice, setSelectedDevice] = useState(null)
  const { devices, isLoading: devicesLoading, isError: devicesError } = useDevices()
  const { data: latestData, isLoading: latestLoading } = useDeviceLatest(selectedDevice)
  const { history, isLoading: historyLoading } = useDeviceHistory(selectedDevice, { limit: 100 })

  // Auto-select first device
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0].device_id)
    }
  }, [devices, selectedDevice])

  const isLoading = devicesLoading || latestLoading || historyLoading

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <RouterIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            DeepFlow IoT Dashboard
          </Typography>
          <Chip
            icon={<SignalCellularAltIcon />}
            label="En vivo"
            color="success"
            size="small"
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Device Selector */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <DeviceSelector
              devices={devices}
              selectedDevice={selectedDevice}
              onSelect={setSelectedDevice}
              isLoading={devicesLoading}
            />
            {selectedDevice && (
              <Typography variant="body2" color="text.secondary">
                Actualización automática cada 5 segundos
              </Typography>
            )}
          </Box>
        </Paper>

        {devicesError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No se pudo conectar a la base de datos. Verifica la configuración de MYSQL_URL.
          </Alert>
        )}

        {!selectedDevice && !devicesLoading && devices.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No hay dispositivos registrados. Los datos aparecerán aquí cuando se guarden en la base de datos.
          </Alert>
        )}

        {selectedDevice && (
          <>
            {/* Stats Cards */}
            <Box sx={{ mb: 3 }}>
              <StatsCards data={latestData} isLoading={latestLoading} />
            </Box>

            {/* Charts and Map Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <TemperatureChart data={history} isLoading={historyLoading} />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <SpeedChart data={history} isLoading={historyLoading} />
              </Grid>
            </Grid>

            {/* Map */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12 }}>
                <DeviceMap
                  data={history}
                  latestData={latestData}
                  isLoading={historyLoading}
                />
              </Grid>
            </Grid>

            {/* Data Table */}
            <DataTable data={history} isLoading={historyLoading} />
          </>
        )}
      </Container>
    </Box>
  )
}
