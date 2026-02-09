const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuración de conexión con logs de error claros
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: { rejectUnauthorized: false } 
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// DIAGNÓSTICO DE RUTAS ABSOLUTAS
const ROUTES = ['resumen', 'calidad', 'riesgo', 'motivos', 'emocion', 'ppm', 'textmining', 'cubo'];
ROUTES.forEach(r => {
    try {
        app.use(`/api/${r}`, require(path.join(__dirname, 'routes', r)));
    } catch (e) {
        console.log(`⚠️  Ruta /api/${r} no disponible:`, e.message);
    }
});

// Endpoint de Stats (KPIs del Menú)
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t FROM "resumen_maestro"');
        res.json({ total_llamadas: Number(result.rows[0].t || 0) });
    } catch (e) {
        res.json({ total_llamadas: 0, status: "error_db" });
    }
});

// PUERTO: Railway inyecta PORT. Si no, usamos 8000.
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR OPERATIVO`);
    console.log(`📡 PUERTO ACTUAL: ${PORT}`);
    console.log(`📍 PATH: ${__dirname}`);
});

// Argumento: Evitamos que el proceso muera por errores no capturados
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
});