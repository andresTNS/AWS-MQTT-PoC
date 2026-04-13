import { NextResponse } from 'next/server'
import { query, isDatabaseConfigured } from '@/lib/db'
import { transformReading } from '@/lib/gps-utils'

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
    
    const readings = await query(
      `SELECT
        t.id,
        d.mac_address              AS device_id,
        t.timestamp_dispositivo    AS timestamp,
        t.temperatura_c,
        t.mA_raw,
        t.latitud,
        t.longitud,
        t.altura_m,
        t.velocidad_kmh,
        t.gps_timestamp
      FROM telemetria t
      INNER JOIN devices d ON d.id = t.device_id
      WHERE d.mac_address = ?
      ORDER BY t.timestamp_dispositivo DESC
      LIMIT 1`,
      [id]
    )

    if (readings.length === 0) {
      return NextResponse.json(
        { error: 'No hay lecturas para este dispositivo' },
        { status: 404 }
      )
    }

    return NextResponse.json(transformReading(readings[0]))
  } catch (error) {
    console.error('Error fetching latest:', error)
    return NextResponse.json(
      { error: 'Error al obtener última lectura' },
      { status: 500 }
    )
  }
}
