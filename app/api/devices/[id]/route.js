import { NextResponse } from 'next/server'
import { query, isDatabaseConfigured } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Base de datos no configurada' },
      { status: 503 }
    )
  }

  try {
    const { id } = await params
    
    const devices = await query(
      `SELECT
        d.mac_address                AS device_id,
        d.nombre,
        d.modelo,
        MIN(t.timestamp_dispositivo) AS first_reading,
        MAX(t.timestamp_dispositivo) AS last_reading,
        COUNT(t.id)                  AS reading_count,
        AVG(t.temperatura_c)         AS avg_temperature,
        MIN(t.temperatura_c)         AS min_temperature,
        MAX(t.temperatura_c)         AS max_temperature
      FROM devices d
      LEFT JOIN telemetria t ON t.device_id = d.id
      WHERE d.mac_address = ?
      GROUP BY d.id, d.mac_address, d.nombre, d.modelo`,
      [id]
    )

    if (devices.length === 0) {
      return NextResponse.json(
        { error: 'Dispositivo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(devices[0])
  } catch (error) {
    console.error('Error fetching device:', error)
    return NextResponse.json(
      { error: 'Error al obtener dispositivo' },
      { status: 500 }
    )
  }
}
