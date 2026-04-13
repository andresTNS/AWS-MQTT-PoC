import mysql from 'mysql2/promise'

let pool = null

function isValidMySQLUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'mysql:' && parsed.host && parsed.pathname
  } catch {
    return false
  }
}

export function isDatabaseConfigured() {
  return isValidMySQLUrl(process.env.MYSQL_URL)
}

function getPool() {
  if (!pool) {
    const mysqlUrl = process.env.MYSQL_URL
    
    if (!isValidMySQLUrl(mysqlUrl)) {
      throw new Error(
        'MYSQL_URL no configurada correctamente. Use el formato: mysql://user:password@host:3306/database'
      )
    }
    
    pool = mysql.createPool(mysqlUrl)
  }
  return pool
}

export async function query(sql, params = []) {
  const connection = getPool()
  const [rows] = await connection.execute(sql, params)
  return rows
}

export async function getConnection() {
  return getPool().getConnection()
}
