const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONEXIÓN INTERNA SEGURA ---
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: { rejectUnauthorized: false } 
});

pool.connect(async (err, client, release) => {
    if (err) return console.error('❌ ERROR:', err.stack);
    console.log('✅ BACKEND CONECTADO A LA DB INTERNA');
    try {
        const res = await client.query('SELECT COUNT(*) FROM "resumen_maestro"');
        console.log(`📊 TOTAL FILAS EN DB: ${res.rows[0].count}`);
    } catch (e) {
        console.error('❌ LA TABLA NO EXISTE EN ESTA DB');
    }
    release();
});

app.use(cors());
app.use(express.json());

// RUTAS
app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining')); 
app.use('/api/cubo', require('./routes/cubo'));

// ENDPOINT STATS
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t, AVG("FINAL") as c, (SUM("tiene_riesgo")::float / NULLIF(SUM("total_gestiones"), 0)) * 100 as r, AVG("tiene_motivo") as m, AVG("TOTAL_EMOCION") as e, AVG("PPM_PROMEDIO") as p FROM "resumen_maestro"');
        const data = result.rows[0];
        res.json({ 
            total_llamadas: Number(data.t || 0), 
            promedio_calidad: `${Number(data.c || 0).toFixed(1)}%`,
            porcentaje_riesgo: `${Number(data.r || 0).toFixed(2)}%`,
            porcentaje_motivo: `${Number(data.m || 0).toFixed(1)}%`,
            promedio_emocion: `${Number(data.e || 0).toFixed(1)}%`,
            promedio_ppm: Number(data.p || 0).toFixed(0)
        });
    } catch (e) { res.status(500).send(e.message); }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 SERVIDOR EN PUERTO ${PORT}`));