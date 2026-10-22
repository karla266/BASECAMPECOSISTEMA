import mysql from 'mysql2/promise';

export function getDbConnection(port: number = 3306) {
  const host = process.env.SICAR_HOST;
  const user = port === 3307 ? process.env.SICAR_USER_3307 : process.env.SICAR_USER_3306;
  const password = port === 3307 ? process.env.SICAR_PASS_3307 : process.env.SICAR_PASS_3306;

  if (!host || !user || !password) {
    throw new Error(
      `Configuración SICAR incompleta para el puerto ${port}: defina SICAR_HOST, ` +
        (port === 3307 ? 'SICAR_USER_3307 y SICAR_PASS_3307' : 'SICAR_USER_3306 y SICAR_PASS_3306') +
        ' en el entorno (.env) antes de conectar.'
    );
  }

  return mysql.createPool({
    host,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}
