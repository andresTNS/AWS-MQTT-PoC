import { Roboto } from 'next/font/google'
import ThemeProvider from '@/components/theme-provider'
import './globals.css'
import 'leaflet/dist/leaflet.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'DeepFlow IoT Dashboard',
  description: 'Monitoreo de dispositivos IoT en tiempo real',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={roboto.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
