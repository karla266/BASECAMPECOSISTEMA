import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.SICAR_HOST || '127.0.0.1',
  port: Number(process.env.SICAR_PORT || 3306),
  user: process.env.SICAR_USER || 'root',
  password: process.env.SICAR_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
} as const;

export const poolMadera = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_MADERA_NAME || 'sicar_madera',
});

export const poolSmokeshop = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_SMOKESHOP_NAME || 'sicar_smokeshop',
});

export const db = poolSmokeshop;
export default poolSmokeshop;

export function getDbConnection(port: number = 3306) {
  const host = process.env.SICAR_HOST || dbConfig.host;
  const user =
    (port === 3307 ? process.env.SICAR_USER_3307 : process.env.SICAR_USER_3306) ||
    process.env.SICAR_USER ||
    dbConfig.user;
  const password =
    (port === 3307 ? process.env.SICAR_PASS_3307 : process.env.SICAR_PASS_3306) ||
    process.env.SICAR_PASSWORD ||
    dbConfig.password;
  const database =
    port === 3307
      ? process.env.DB_SMOKESHOP_NAME || 'sicar_smokeshop'
      : process.env.DB_MADERA_NAME || 'sicar_madera';

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}
