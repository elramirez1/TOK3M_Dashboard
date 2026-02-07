const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://danielramirezquintana@localhost:5432/tokem_db',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.set('pool', pool);
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- RUTAS (IMPORTANTE: Asegúrate de que los archivos existan) ---
app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining')); 
app.use('/api/cubo', require('./routes/cubo'));

// --- LOGIN SEGURO ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        return res.json({ token: 'fake-jwt-token', user: 'admin' });
    }
    res.status(401).json({ message: 'Error' });
});

// --- STATS MAESTRO: ESTO ES LO QUE LLENA EL DASHBOARD ---
app.get('/api/stats', async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        let w = '';
        if (inicio && fin && inicio !== '' && fin !== '') {
            const i = inicio.replace(/-/g, '');
            const f = fin.replace(/-/g, '');
            w = `WHERE ymd BETWEEN ${i} AND ${f}`;
        }

        // Usamos comillas dobles en FINAL, TOTAL_EMOCION y PPM_PROMEDIO porque PG es estricto
        const query = `
            SELECT 
                COALESCE(SUM(total_gestiones), 0) as t,
                COALESCE(AVG("FINAL"), 0) as c,
                COALESCE((SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100, 0) as r,
                COALESCE(AVG(tiene_motivo), 0) as m,
                COALESCE(AVG("TOTAL_EMOCION"), 0) as e,
                COALESCE(AVG("PPM_PROMEDIO"), 0) as p
            FROM resumen_maestro ${w}
        `;

        const result = await pool.query(query);
        const data = result.rows[0];

        res.json({ 
            total_llamadas: Number(data.t || 0), 
            promedio_calidad: `${Number(data.c || 0).toFixed(1)}%`,
            porcentaje_riesgo: `${Number(data.r || 0).toFixed(1)}%`,
            porcentaje_motivo: `${Number(data.m || 0).toFixed(1)}%`,
            promedio_emocion: `${Number(data.e || 0).toFixed(1)}%`,
            promedio_ppm: Number(data.p || 0)
        });
    } catch (e) { 
        console.error("ERROR EN STATS:", e.message);
        // Si falla, enviamos ceros para que el Dashboard NO se ponga blanco
        res.json({ total_llamadas: 0, promedio_calidad: '0%', porcentaje_riesgo: '0%', porcentaje_motivo: '0%', promedio_emocion: '0%', promedio_ppm: 0 });
    }
});

app.get('/api/heatmap', async (req, res) => {
    try {
        const q = `SELECT TO_CHAR(TO_DATE(NULLIF(ymd, 0)::text, 'YYYYMMDD'), 'YYYY-MM-DD') as f, SUM(total_gestiones) as t FROM resumen_maestro WHERE ymd > 0 GROUP BY ymd`;
        const r = await pool.query(q);
        const out = {};
        r.rows.forEach(row => { if(row.f) out[row.f] = row.t; });
        res.json(out);
    } catch (e) { res.json({}); }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Online en ${PORT}`));