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
    const { searchParams } = new URL(request.url)
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let sql = `
      SELECT
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
    `
    const queryParams = [id]

    if (startDate) {
      sql += ' AND timestamp >= ?'
      queryParams.push(startDate)
    }

    if (endDate) {
      sql += ' AND timestamp <= ?'
      queryParams.push(endDate)
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?'
    queryParams.push(limit)

    const readings = await query(sql, queryParams)
    const transformedReadings = readings.map(transformReading)

    return NextResponse.json(transformedReadings)
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    )
  }
}
