import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const pool3306 = getDbConnection(3306);
    const [rows3306]: any = await pool3306.query('SELECT DATABASE() as db, NOW() as hora;');
    results.puerto_3306 = { status: 'OK ✅', data: rows3306[0] };
  } catch (err: any) {
    results.puerto_3306 = { status: 'ERROR ❌', mensaje: err.message };
  }

  try {
    const pool3307 = getDbConnection(3307);
    const [rows3307]: any = await pool3307.query('SELECT DATABASE() as db, NOW() as hora;');
    results.puerto_3307 = { status: 'OK ✅', data: rows3307[0] };
  } catch (err: any) {
    results.puerto_3307 = { status: 'ERROR ❌', mensaje: err.message };
  }

  return NextResponse.json(results);
}
