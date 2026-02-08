const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONEXIÓN DE HIERRO ---
// Usamos la URL interna que es la que manda dentro de Railway
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: { rejectUnauthorized: false } 
});

app.use(cors());
app.use(express.json());

// Middleware para pasar el pool a las rutas (Crucial para que no fallen los routers)
app.set('pool', pool);

// --- ENDPOINTS MÍNIMOS PARA QUE EL FRONT NO EXPLOTE ---
app.get('/api/heatmap', async (req, res) => {
    try {
        const result = await pool.query('SELECT TO_CHAR(TO_DATE(NULLIF("ymd", 0)::text, \'YYYYMMDD\'), \'YYYY-MM-DD\') as fecha, SUM("total_gestiones")::int as total FROM "resumen_maestro" GROUP BY "ymd"');
        const heatmapData = {};
        result.rows.forEach(row => { if (row.fecha) heatmapData[row.fecha] = row.total; });
        res.json(heatmapData);
    } catch (e) { res.json({}); }
});

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
    } catch (e) { 
        res.json({ total_llamadas: 0, promedio_calidad: '0%', porcentaje_riesgo: '0%', porcentaje_motivo: '0%', promedio_emocion: '0%', promedio_ppm: 0 }); 
    }
});

// --- CARGA DE RUTAS ---
app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining')); 
app.use('/api/cubo', require('./routes/cubo'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 SERVIDOR RESTAURADO EN PUERTO ${PORT}`));