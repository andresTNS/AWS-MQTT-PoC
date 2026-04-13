import { query } from '../lib/db.js'
import { parseLatitude, parseLongitude, parseAltitude, parseSpeed } from '../lib/gps-utils.js'

/**
 * Convierte MAC sin separadores a formato con dos puntos.
 * Ejemplo: '6053057AD6F2' → '60:53:05:7A:D6:F2'
 */
function formatMac(deviceId) {
  return deviceId.match(/.{2}/g).join(':').toUpperCase()
}

/**
 * Parsea el timestamp del GPS del Milesight.
 * Soporta ISO 8601 ("2026-04-10T20:45:38Z") y formato compacto ("20260410 20:45:38").
 * Retorna Date o null si el valor es inválido.
 */
function parseGpsTimestamp(ts) {
  if (!ts) return null

  // Formato compacto Milesight: "20260410 20:45:38"
  const compact = ts.match(/^(\d{4})(\d{2})(\d{2})\s+(\d{2}:\d{2}:\d{2})$/)
  if (compact) {
    return new Date(`${compact[1]}-${compact[2]}-${compact[3]}T${compact[4]}Z`)
  }

  // ISO 8601 estándar
  const date = new Date(ts)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Procesa un mensaje MQTT recibido desde AWS IoT Core,
 * parsea el payload y lo inserta en la tabla telemetria.
 */
export async function processMessage(topic, payload) {
  let data

  try {
    data = JSON.parse(payload.toString())
  } catch (err) {
    console.error('[Collector] Payload inválido — no es JSON válido:', err.message)
    return
  }

  const macAddress = formatMac(data.device_id)

  // Buscar device_id interno por MAC address
  const devices = await query(
    'SELECT id FROM devices WHERE mac_address = ?',
    [macAddress]
  )

  if (devices.length === 0) {
    console.warn(`[Collector] Dispositivo no registrado en BD: ${macAddress}`)
    return
  }

  const deviceId = devices[0].id

  await query(
    `INSERT INTO telemetria
       (device_id, timestamp_dispositivo, temperatura_c, mA_raw,
        latitud, longitud, altura_m, velocidad_kmh, gps_timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      deviceId,
      new Date(data.timestamp),
      data.temperatura_c   ?? null,
      data.mA_raw          ?? null,
      parseLatitude(data.gps?.latitude),
      parseLongitude(data.gps?.longitude),
      parseAltitude(data.gps?.height),
      parseSpeed(data.gps?.speed),
      parseGpsTimestamp(data.gps?.timestamp),
    ]
  )

  console.log(
    `[Collector] ✓ Insertado | Device: ${macAddress} | ` +
    `Temp: ${data.temperatura_c}°C | ` +
    `GPS: ${data.gps?.latitude}, ${data.gps?.longitude}`
  )
}
