import mqtt from 'mqtt'
import { readFileSync } from 'fs'
import { join } from 'path'
import { processMessage } from './processor.js'

const CERT_DIR  = join(process.cwd(), 'credenciales')
const ENDPOINT  = process.env.AWS_IOT_ENDPOINT
const TOPIC     = process.env.MQTT_TOPIC || 'dispositivos/ur41/telemetria'
const CLIENT_ID = `deepflow-collector-${Date.now()}`

const CERT_FILES = {
  cert: 'e12372f3bbafaeffa12ba8ca4faaa6ee1cfa7fdb7158b990ae33b2ba3bcf9f5a-certificate.pem.crt',
  key:  'e12372f3bbafaeffa12ba8ca4faaa6ee1cfa7fdb7158b990ae33b2ba3bcf9f5a-private.pem.key',
  ca:   'AmazonRootCA1.pem',
}

export function startCollector() {
  if (!ENDPOINT) {
    console.error('[Collector] AWS_IOT_ENDPOINT no configurado en .env.local — collector no iniciado.')
    return
  }

  console.log('[Collector] Iniciando conexión a AWS IoT Core...')
  console.log(`[Collector] Endpoint : ${ENDPOINT}`)
  console.log(`[Collector] Topic    : ${TOPIC}`)

  const client = mqtt.connect(`mqtts://${ENDPOINT}:8883`, {
    clientId:          CLIENT_ID,
    cert:              readFileSync(join(CERT_DIR, CERT_FILES.cert)),
    key:               readFileSync(join(CERT_DIR, CERT_FILES.key)),
    ca:                readFileSync(join(CERT_DIR, CERT_FILES.ca)),
    rejectUnauthorized: true,
  })

  client.on('connect', () => {
    console.log('[Collector] ✓ Conectado a AWS IoT Core')
    client.subscribe(TOPIC, (err) => {
      if (err) {
        console.error('[Collector] Error al suscribirse al topic:', err.message)
      } else {
        console.log(`[Collector] ✓ Suscrito a: ${TOPIC}`)
      }
    })
  })

  client.on('message', async (topic, payload) => {
    try {
      await processMessage(topic, payload)
    } catch (err) {
      console.error('[Collector] Error procesando mensaje:', err.message)
    }
  })

  client.on('error', (err) => {
    console.error('[Collector] Error de conexión MQTT:', err.message)
  })

  client.on('reconnect', () => {
    console.log('[Collector] Reconectando a AWS IoT Core...')
  })

  client.on('disconnect', () => {
    console.log('[Collector] Desconectado de AWS IoT Core')
  })

  client.on('offline', () => {
    console.warn('[Collector] Cliente MQTT offline')
  })
}
