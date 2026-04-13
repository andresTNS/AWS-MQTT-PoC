'use client'

import { FormControl, InputLabel, Select, MenuItem, Chip, Box, CircularProgress } from '@mui/material'
import DevicesIcon from '@mui/icons-material/Devices'

export default function DeviceSelector({ devices, selectedDevice, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <span>Cargando dispositivos...</span>
      </Box>
    )
  }

  if (!devices || devices.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DevicesIcon color="disabled" />
        <span>No hay dispositivos disponibles</span>
      </Box>
    )
  }

  return (
    <FormControl sx={{ minWidth: 280 }} size="small">
      <InputLabel id="device-select-label">Dispositivo</InputLabel>
      <Select
        labelId="device-select-label"
        value={selectedDevice || ''}
        label="Dispositivo"
        onChange={(e) => onSelect(e.target.value)}
        startAdornment={<DevicesIcon sx={{ mr: 1, color: 'text.secondary' }} />}
      >
        {devices.map((device) => (
          <MenuItem key={device.device_id} value={device.device_id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
              <span>{device.device_id}</span>
              <Chip
                label={`${device.reading_count} lecturas`}
                size="small"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
