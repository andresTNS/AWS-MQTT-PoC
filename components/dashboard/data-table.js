'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Skeleton,
  Box,
} from '@mui/material'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCoordinates } from '@/lib/gps-utils'

export default function DataTable({ data, isLoading }) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historial de Lecturas
          </Typography>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </Card>
    )
  }

  const rows = data || []
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Historial de Lecturas
        </Typography>
        {rows.length === 0 ? (
          <Box
            sx={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">No hay datos disponibles</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha/Hora</TableCell>
                    <TableCell align="right">Temperatura</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell align="right">Altitud</TableCell>
                    <TableCell align="right">Velocidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        {format(new Date(row.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${row.temperatura_c?.toFixed(1)}°C`}
                          size="small"
                          sx={{
                            bgcolor: row.temperatura_c > 35 ? 'error.main' : 
                                    row.temperatura_c > 30 ? 'warning.main' : 'success.main',
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {formatCoordinates(row.gps?.latitude, row.gps?.longitude)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {row.gps?.altura?.toFixed(1) || '--'} m
                      </TableCell>
                      <TableCell align="right">
                        {row.gps?.speed?.toFixed(1) || '--'} km/h
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
