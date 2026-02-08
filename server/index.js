const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONFIGURACIÓN DE CONEXIÓN OPTIMIZADA PARA RAILWAY ---
// Railway inyecta automáticamente DATABASE_URL. Si no existe, usamos la interna.
const internalConnectionString = 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway';

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || internalConnectionString,
    ssl: { rejectUnauthorized: false } 
});

// Verificación de salud de la base de datos
pool.connect(async (err, client, release) => {
    if (err) {
        console.error('❌ ERROR CRÍTICO DE CONEXIÓN:', err.stack);
    } else {
        console.log('✅ CONECTADO AL POSTGRES INTERNO DE RAILWAY');
        try {
            // Verificamos si la tabla existe y cuántos datos tiene
            const res = await client.query('SELECT COUNT(*) as total FROM "resumen_maestro"');
            console.log(`📊 ÉXITO: Se encontraron ${res.rows[0].total} registros en "resumen_maestro"`);
        } catch (e) {
            console.error('⚠️ ATENCIÓN: Conectado a la BD, pero no veo la tabla "resumen_maestro":', e.message);
        }
        release();
    }
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// --- AUTH (Bypass para pruebas en test) ---
app.post('/api/auth/login', (req, res) => {
    res.json({ token: 'fake-jwt-token', user: 'admin' });
});

// --- RUTAS ---
app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining')); 
app.use('/api/cubo', require('./routes/cubo'));

// --- STATS SIMPLE PARA TEST ---
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t FROM "resumen_maestro"');
        res.json({ 
            total_llamadas: Number(result.rows[0].t || 0),
            status: "ok" 
        });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 SERVIDOR CORRIENDO EN PUERTO ${PORT}`));