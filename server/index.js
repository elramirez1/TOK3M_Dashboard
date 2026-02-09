const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Configuración con la URL INTERNA que proporcionaste
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    // En red interna eliminamos SSL estricto para evitar bloqueos de handshake
    ssl: false, 
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

// Diagnóstico de conexión inmediata
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ ERROR DE CONEXIÓN INTERNA:', err.message);
    } else {
        console.log('✅ CONEXIÓN EXITOSA A BASE DE DATOS INTERNA');
        release();
    }
});

app.use(cors());
app.use(express.json());
app.set('pool', pool);

// --- ENDPOINTS DE DATOS ---

app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t, AVG("FINAL") as c FROM "resumen_maestro"');
        const data = result.rows[0];
        res.json({ 
            total_llamadas: Number(data.t || 0), 
            promedio_calidad: `${Number(data.c || 0).toFixed(1)}%`
        });
    } catch (e) {
        console.error('Error en /api/stats:', e.message);
        res.json({ total_llamadas: 0, error: e.message });
    }
});

// Carga de rutas de módulos
const modules = ['resumen', 'calidad', 'riesgo', 'motivos', 'emocion', 'ppm', 'textmining', 'cubo'];
modules.forEach(route => {
    try {
        app.use(`/api/${route}`, require(`./routes/${route}`));
    } catch (err) {
        console.error(`⚠️ No se pudo cargar la ruta ./routes/${route}`);
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR EN PUERTO ${PORT} CONECTADO A RED INTERNA`);
});