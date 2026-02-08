const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONFIGURACIÓN DE CONEXIÓN ---
const DATABASE_URL_RAILWAY = 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@shortline.proxy.rlwy.net:50330/railway';

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || DATABASE_URL_RAILWAY,
    ssl: { rejectUnauthorized: false } 
});

// --- AUTO-DIAGNÓSTICO AL ARRANCAR ---
pool.connect(async (err, client, release) => {
  if (err) return console.error('❌ ERROR CRÍTICO DE CONEXIÓN:', err.stack);
  
  console.log('✅ CONECTADO A POSTGRES EN RAILWAY');
  
  try {
    const res = await client.query('SELECT COUNT(*) FROM "resumen_maestro"');
    console.log(`📊 DIAGNÓSTICO: La tabla "resumen_maestro" tiene ${res.rows[0].count} filas.`);
    
    if (res.rows[0].count === "0") {
      console.log('⚠️ ALERTA: La tabla existe pero está VACÍA. Por eso ves ceros.');
    }
  } catch (e) {
    console.error('❌ ERROR DE TABLA: La tabla "resumen_maestro" NO existe o el nombre está mal escrito:', e.message);
  } finally {
    release();
  }
});

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

app.use('/api/resumen', resumenRoutes);
app.use('/api/calidad', calidadRoutes);
app.use('/api/riesgo', riesgoRoutes);
app.use('/api/motivos', motivosRoutes);
app.use('/api/emocion', emocionRoutes);
app.use('/api/ppm', ppmRoutes);
app.use('/api/textmining', textminingRoutes);
app.use('/api/cubo', cuboRoutes);

// --- ENDPOINTS PRINCIPALES ---
app.get('/api/heatmap', async (req, res) => {
    try {
        const query = 'SELECT TO_CHAR(TO_DATE(NULLIF("ymd", 0)::text, \'YYYYMMDD\'), \'YYYY-MM-DD\') as fecha, SUM("total_gestiones")::int as total FROM "resumen_maestro" WHERE "ymd" IS NOT NULL AND "ymd" > 0 GROUP BY "ymd" ORDER BY "ymd" ASC';
        const result = await pool.query(query);
        const heatmapData = {};
        result.rows.forEach(row => { if (row.fecha) heatmapData[row.fecha] = row.total; });
        res.json(heatmapData);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stats', async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        let w = '';
        if (inicio && fin) {
            const i = inicio.replace(/-/g, '');
            const f = fin.replace(/-/g, '');
            w = `WHERE "ymd" BETWEEN ${i} AND ${f}`;
        }
        const query = `SELECT SUM("total_gestiones")::bigint as t, AVG("FINAL") as c, (SUM("tiene_riesgo")::float / NULLIF(SUM("total_gestiones"), 0)) * 100 as r, AVG("tiene_motivo") as m, AVG("TOTAL_EMOCION") as e, AVG("PPM_PROMEDIO") as p FROM "resumen_maestro" ${w}`;
        const result = await pool.query(query);
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