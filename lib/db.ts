// ============================================
// 資料庫連接配置
// ============================================

import mysql from 'mysql2/promise'

// 資料庫連接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'teacher_collaboration_system',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool

// 輔助函數：執行查詢
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// 輔助函數：執行事務
export async function transaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  
  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}


