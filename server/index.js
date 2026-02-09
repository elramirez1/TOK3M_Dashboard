const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// Diagnóstico de rutas para asegurar que encuentre 'routes'
const BASE_DIR = __dirname;
const ROUTES_DIR = path.join(BASE_DIR, 'routes');

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: { rejectUnauthorized: false } 
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// Argumento: Cargamos las rutas con validación de existencia
const routeModules = ['resumen', 'calidad', 'riesgo', 'motivos', 'emocion', 'ppm', 'textmining', 'cubo'];

routeModules.forEach(route => {
    try {
        app.use(`/api/${route}`, require(path.join(ROUTES_DIR, route)));
    } catch (err) {
        console.error(`⚠️ No se pudo cargar la ruta /api/${route}:`, err.message);
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t FROM "resumen_maestro"');
        res.json({ total_llamadas: Number(result.rows[0].t || 0) });
    } catch (e) { 
        res.json({ total_llamadas: 0, status: "waiting_db" }); 
    }
});

// El puerto dinámico es la clave para que Railway no mate el proceso
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR COMPROBADO`);
    console.log(`📍 UBICACIÓN: ${BASE_DIR}`);
    console.log(`📡 PUERTO: ${PORT}`);
});