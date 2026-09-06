const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const configPapeleria = { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'sicar' };
const configGeneral = { host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'sicar' };

async function consultarMySQL(config, sql, params = []) {
    try {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute(sql, params);
        await connection.end();
        return rows;
    } catch (error) {
        return [];
    }
}

app.post('/api/v1/asistente-local', async (req, res) => {
    try {
        const { comando } = req.body;
        if (!comando) return res.status(400).json({ respuesta: 'Sin instrucción.' });

        let texto = comando.toLowerCase()
            .replace('tulio', '').replace('oye', '')
            .replace('cuanto cuesta', '').replace('precio de', '')
            .replace('cuantas', '').replace('cuantos', '')
            .replace('hay', '').replace('quedan', '')
            .trim();

        console.log(`🗣️ Buscando exactamente: "${texto}"`);

        if (texto.length < 3) {
            return res.json({ respuesta: 'Por favor dime el nombre del producto que buscas.' });
        }

        // Búsqueda directa y ultra flexible (cualquier producto que contenga la frase)
        const sqlProducto = `
            SELECT descripcion, existencia, precio1 AS precio 
            FROM articulo 
            WHERE descripcion LIKE ? 
            ORDER BY existencia DESC LIMIT 2;
        `;
        const params = [`%${texto}%`];

        const [resPapeleria, resGeneral] = await Promise.all([
            consultarMySQL(configPapeleria, sqlProducto, params),
            consultarMySQL(configGeneral, sqlProducto, params)
        ]);

        let resultados = [];
        if (resPapeleria.length > 0) resPapeleria.forEach(p => resultados.push({ ...p, negocio: 'Papelería' }));
        if (resGeneral.length > 0) resGeneral.forEach(p => resultados.push({ ...p, negocio: 'Tienda General' }));

        if (resultados.length === 0) {
            return res.json({ respuesta: `No tenemos inventario registrado para la palabra ${texto}.` });
        }

        const prod = resultados[0];
        const existencia = Math.floor(prod.existencia || 0);
        const precio = Number(prod.precio || 0).toFixed(2);
        
        const respuestaVoz = existencia > 0 
            ? `En ${prod.negocio}, quedan ${existencia} piezas de ${prod.descripcion.trim()} a $${precio} pesos.`
            : `El producto ${prod.descripcion.trim()} está agotado en ${prod.negocio}. Cuesta $${precio} pesos.`;

        return res.json({ respuesta: respuestaVoz });

    } catch (e) {
        return res.json({ respuesta: 'Error al conectar con SICAR.' });
    }
});

app.listen(3000, () => console.log('🚀 Backend Node.js activo y listo.'));
