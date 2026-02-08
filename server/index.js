const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONFIGURACIÓN DE CONEXIÓN DINÁMICA ---
// Si existe DATABASE_URL (Railway), se conecta a la nube. Si no, a tu localhost.
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://danielramirezquintana@localhost:5432/tokem_db',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Configuración de Middlewares
app.set('pool', pool);
app.use(cors());
app.use(express.json());

// --- AUTENTICACIÓN ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        return res.json({ token: 'fake-jwt-token', user: 'admin' });
    }
    return res.status(401).json({ message: 'Credenciales inválidas' });
});

// --- IMPORTACIÓN DE RUTAS ---
const resumenRoutes = require('./routes/resumen');
const calidadRoutes = require('./routes/calidad');
const riesgoRoutes = require('./routes/riesgo');
const motivosRoutes = require('./routes/motivos');
const emocionRoutes = require('./routes/emocion');
const ppmRoutes = require('./routes/ppm');
const textminingRoutes = require('./routes/textmining'); 
const cuboRoutes = require('./routes/cubo');

// --- DEFINICIÓN DE ENDPOINTS ---
app.use('/api/resumen', resumenRoutes);
app.use('/api/calidad', calidadRoutes);
app.use('/api/riesgo', riesgoRoutes);
app.use('/api/motivos', motivosRoutes);
app.use('/api/emocion', emocionRoutes);
app.use('/api/ppm', ppmRoutes);
app.use('/api/textmining', textminingRoutes);
app.use('/api/cubo', cuboRoutes);

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

// --- ENDPOINT: STATS (KPIS DEL MENÚ) ---
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

// --- INICIO DEL SERVIDOR ---
// Railway asigna el puerto automáticamente mediante process.env.PORT
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR ACTIVO EN PUERTO ${PORT}`);
});