// ARGUMENTO DE DIAGNÓSTICO: Restauración de lógica de Auth y Heatmap.
// Se mantiene la conexión interna de Railway pero se reintegra el endpoint de Login.

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONFIGURACIÓN DE CONEXIÓN (Mantenemos la de Railway que ya funciona) ---
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: false, 
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

// Verificación de conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ ERROR DE CONEXIÓN INTERNA:', err.message);
    } else {
        console.log('✅ CONEXIÓN EXITOSA A BASE DE DATOS INTERNA');
        release();
    }
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// ==========================================
// --- REINTEGRACIÓN: AUTENTICACIÓN ---
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Esta es la lógica que tenías en tu PC
    if (username === 'admin' && password === 'admin123') {
        return res.json({ 
            token: 'fake-jwt-token', 
            user: 'admin',
            message: 'Bienvenido al sistema TOK3M'
        });
    }
    return res.status(401).json({ message: 'Credenciales inválidas' });
});

// --- ENDPOINT: HEATMAP ---
app.get('/api/heatmap', async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(TO_DATE(NULLIF(ymd, 0)::text, 'YYYYMMDD'), 'YYYY-MM-DD') as fecha,
                SUM(total_gestiones)::int as total
            FROM resumen_maestro
            WHERE ymd IS NOT NULL AND ymd > 0
            GROUP BY ymd
            ORDER BY ymd ASC
        `;
        const result = await pool.query(query);
        const heatmapData = {};
        result.rows.forEach(row => { 
            if (row.fecha) heatmapData[row.fecha] = row.total; 
        });
        res.json(heatmapData);
    } catch (e) { 
        console.error("Error en Heatmap:", e);
        res.status(500).json({ error: e.message }); 
    }
});

// --- ENDPOINT: STATS (KPIS) ---
app.get('/api/stats', async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        let w = '';
        if (inicio && fin) {
            const i = inicio.replace(/-/g, '');
            const f = fin.replace(/-/g, '');
            w = `WHERE ymd BETWEEN ${i} AND ${f}`;
        }

        const queryMaestra = `
            SELECT 
                SUM(total_gestiones)::bigint as t,
                AVG("FINAL") as c,
                (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as r,
                AVG(tiene_motivo) as m,
                AVG("TOTAL_EMOCION") as e,
                AVG("PPM_PROMEDIO") as p
            FROM resumen_maestro 
            ${w}
        `;

        const result = await pool.query(queryMaestra);
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
        console.error("Error en Stats Maestro:", e);
        res.status(500).send(e.message); 
    }
});

// --- IMPORTACIÓN DE RUTAS ---
app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining'));
app.use('/api/cubo', require('./routes/cubo'));

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR MAESTRO OPERATIVO EN PUERTO ${PORT}`);
});