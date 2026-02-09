const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// DIAGNÓSTICO DE RUTA: Esto aparecerá en tu log de Railway
console.log("📍 Directorio actual de ejecución:", process.cwd());
console.log("📍 __dirname actual:", __dirname);

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: { rejectUnauthorized: false } 
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// Argumento: Usamos rutas absolutas para que no importe el comando de inicio
const RESOLVED_ROUTES = path.join(__dirname, 'routes');

try {
    app.use('/api/resumen', require(path.join(RESOLVED_ROUTES, 'resumen')));
    app.use('/api/calidad', require(path.join(RESOLVED_ROUTES, 'calidad')));
    app.use('/api/riesgo', require(path.join(RESOLVED_ROUTES, 'riesgo')));
    app.use('/api/motivos', require(path.join(RESOLVED_ROUTES, 'motivos')));
    app.use('/api/emocion', require(path.join(RESOLVED_ROUTES, 'emocion')));
    app.use('/api/ppm', require(path.join(RESOLVED_ROUTES, 'ppm')));
    app.use('/api/textmining', require(path.join(RESOLVED_ROUTES, 'textmining'))); 
    app.use('/api/cubo', require(path.join(RESOLVED_ROUTES, 'cubo')));
} catch (e) {
    console.error("❌ Error cargando rutas críticas:", e.message);
}

app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t FROM "resumen_maestro"');
        res.json({ total_llamadas: Number(result.rows[0].t || 0) });
    } catch (e) { res.json({ total_llamadas: 0 }); }
});

// ESCUCHAR EN 0.0.0.0 ES OBLIGATORIO EN RAILWAY
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BACKEND ESTABLE Y LISTO EN PUERTO ${PORT}`);
});