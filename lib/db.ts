import mysql from 'mysql2/promise';

export function getDbConnection(port: number = 3306) {
  const host = process.env.SICAR_HOST || '187.146.113.128';
  const user = port === 3307 ? process.env.SICAR_USER_3307 : process.env.SICAR_USER_3306;
  const password = port === 3307 ? process.env.SICAR_PASS_3307 : process.env.SICAR_PASS_3306;

  return mysql.createPool({
    host,
    port,
    user: user || 'root',
    password: password || 'Basecamp420!',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}
