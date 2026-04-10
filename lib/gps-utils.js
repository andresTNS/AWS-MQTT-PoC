/**
 * Parse GPS latitude string like "33.393732 S" to decimal
 */
export function parseLatitude(latStr) {
  if (!latStr || typeof latStr !== 'string') return null
  
  const match = latStr.match(/^([\d.]+)\s*([NSns])$/i)
  if (!match) {
    const num = parseFloat(latStr)
    return isNaN(num) ? null : num
  }
  
  const value = parseFloat(match[1])
  const direction = match[2].toUpperCase()
  
  return direction === 'S' ? -value : value
}

/**
 * Parse GPS longitude string like "70.556637 W" to decimal
 */
export function parseLongitude(lonStr) {
  if (!lonStr || typeof lonStr !== 'string') return null
  
  const match = lonStr.match(/^([\d.]+)\s*([EWew])$/i)
  if (!match) {
    const num = parseFloat(lonStr)
    return isNaN(num) ? null : num
  }
  
  const value = parseFloat(match[1])
  const direction = match[2].toUpperCase()
  
  return direction === 'W' ? -value : value
}

/**
 * Parse altitude string like "739.9M" to number
 */
export function parseAltitude(altStr) {
  if (!altStr || typeof altStr !== 'string') return null
  
  const match = altStr.match(/^([\d.]+)\s*[Mm]?$/)
  if (!match) return null
  
  return parseFloat(match[1])
}

/**
 * Parse speed string like "0.000000 km/h" to number
 */
export function parseSpeed(speedStr) {
  if (!speedStr || typeof speedStr !== 'string') return null
  
  const match = speedStr.match(/^([\d.]+)\s*(km\/h)?$/i)
  if (!match) return null
  
  return parseFloat(match[1])
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lon) {
  if (lat === null || lon === null) return 'N/A'
  
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`
}

/**
 * Transform raw device reading to parsed format.
 * Los campos latitud, longitud, altura_m y velocidad_kmh ya vienen
 * como valores numéricos desde la BD (DECIMAL), no requieren parseo.
 */
export function transformReading(reading) {
  return {
    id: reading.id,
    device_id: reading.device_id,
    timestamp: reading.timestamp,
    temperatura_c: reading.temperatura_c,
    mA_raw: reading.mA_raw,
    gps: {
      latitude: reading.latitud,
      longitude: reading.longitud,
      altura: reading.altura_m,
      speed: reading.velocidad_kmh,
      timestamp: reading.gps_timestamp,
    },
  }
}

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
