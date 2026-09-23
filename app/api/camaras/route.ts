import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
}

// GET: Obtener todas las cámaras
export async function GET() {
  try {
    const db = await getDbConnection();
    const [rows] = await db.execute('SELECT * FROM camaras_cliente ORDER BY id DESC');
    await db.end();
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Registrar una nueva cámara (IP Directa o DVR)
export async function POST(request: Request) {
  try {
    const { id_cliente, nombre_camara, tipo, rtsp_url, zona_vigilada } = await request.json();

    const db = await getDbConnection();
    const [result]: any = await db.execute(
      `INSERT INTO camaras_cliente (id_cliente, nombre_camara, tipo, rtsp_url, zona_vigilada) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_cliente || 1, nombre_camara, tipo, rtsp_url, zona_vigilada || 'Mostrador']
    );
    await db.end();

    return NextResponse.json({
      success: true,
      mensaje: '📷 Cámara registrada correctamente',
      id: result.insertId
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
