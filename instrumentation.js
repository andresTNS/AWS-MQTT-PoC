/**
 * Next.js Instrumentation Hook
 * Se ejecuta automáticamente al iniciar el servidor (dev y producción).
 * Inicia el collector MQTT integrado con la aplicación.
 */
export async function register() {
  // Solo ejecutar en el runtime de Node.js (no en Edge Runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCollector } = await import('./collector/mqtt-client.js')
    startCollector()
  }
}
