const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONFIGURACIÓN DE CONEXIÓN HÍBRIDA ---
const connectionString = process.env.DATABASE_URL || 'postgresql://danielramirezquintana@localhost:5432/tokem_db';

const pool = new Pool({ 
    connectionString: connectionString,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// --- MIDDLEWARES ---
app.set('pool', pool);
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// --- ENDPOINT: STATS (KPIS MAESTRO) ---
app.get('/api/stats', async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        let w = '';
        
        if (inicio && fin && inicio !== '' && fin !== '') {
            const i = inicio.replace(/-/g, '');
            const f = fin.replace(/-/g, '');
            w = `WHERE ymd BETWEEN ${i} AND ${f}`;
        }

        const queryMaestra = `
            SELECT 
                COALESCE(SUM(total_gestiones), 0)::bigint as total_llamadas,
                COALESCE(AVG("FINAL"), 0) as promedio_calidad,
                COALESCE((SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100, 0) as porcentaje_riesgo,
                COALESCE(AVG(tiene_motivo), 0) as porcentaje_motivo,
                COALESCE(AVG("TOTAL_EMOCION"), 0) as promedio_emocion,
                COALESCE(AVG("PPM_PROMEDIO"), 0) as promedio_ppm
            FROM resumen_maestro 
            ${w}
        `;

        const result = await pool.query(queryMaestra);
        const data = result.rows[0];

        // Mapeo explícito para que el Frontend reciba exactamente lo que espera
        res.json({ 
            total_llamadas: Number(data.total_llamadas || 0), 
            promedio_calidad: `${Number(data.promedio_calidad || 0).toFixed(1)}%`,
            porcentaje_riesgo: `${Number(data.porcentaje_riesgo || 0).toFixed(2)}%`,
            porcentaje_motivo: `${Number(data.porcentaje_motivo || 0).toFixed(1)}%`,
            promedio_emocion: `${Number(data.promedio_emocion || 0).toFixed(1)}%`,
            promedio_ppm: Math.round(Number(data.promedio_ppm || 0))
        });
    } catch (e) { 
        console.error("Error en Stats Maestro:", e);
        res.status(500).json({ error: e.message }); 
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`
    🚀 SERVIDOR MAESTRO ACTIVO EN PUERTO ${PORT}
    `);
});