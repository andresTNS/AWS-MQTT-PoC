import { NextResponse } from 'next/server'
import { query, isDatabaseConfigured } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { 
        error: 'Base de datos no configurada',
        message: 'Configure MYSQL_URL con formato: mysql://user:password@host:3306/database'
      },
      { status: 503 }
    )
  }

  try {
    const devices = await query(`
      SELECT
        d.mac_address          AS device_id,
        d.nombre,
        d.modelo,
        d.topic_mqtt,
        MAX(t.timestamp_dispositivo) AS last_reading,
        COUNT(t.id)            AS reading_count
      FROM devices d
      LEFT JOIN telemetria t ON t.device_id = d.id
      WHERE d.activo = 1
      GROUP BY d.id, d.mac_address, d.nombre, d.modelo, d.topic_mqtt
      ORDER BY last_reading DESC
    `)

    return NextResponse.json(devices)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: 'Error al obtener dispositivos' },
      { status: 500 }
    )
  }
}
