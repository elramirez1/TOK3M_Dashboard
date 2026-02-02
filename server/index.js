const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const pool = new Pool({ user: 'danielramirezquintana', host: 'localhost', database: 'tokem_db', port: 5432 });

app.set('pool', pool);
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') return res.json({ token: 'fake-jwt-token', user: 'admin' });
    return res.status(401).json({ message: 'Credenciales inválidas' });
});

const resumenRoutes = require('./routes/resumen');
const calidadRoutes = require('./routes/calidad');
const riesgoRoutes = require('./routes/riesgo');
const motivosRoutes = require('./routes/motivos');
const emocionRoutes = require('./routes/emocion');
const ppmRoutes = require('./routes/ppm');
const textminingRoutes = require('./routes/textmining'); // <-- AGREGADO

app.use('/api/resumen', resumenRoutes);
app.use('/api/calidad', calidadRoutes);
app.use('/api/riesgo', riesgoRoutes);
app.use('/api/motivos', motivosRoutes);
app.use('/api/emocion', emocionRoutes);
app.use('/api/ppm', ppmRoutes);
app.use('/api/textmining', textminingRoutes); // <-- AGREGADO

app.get('/api/heatmap', async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(TO_DATE(NULLIF(ymd, 0)::text, 'YYYYMMDD'), 'YYYY-MM-DD') as fecha,
                SUM(total_gestiones)::int as total
            FROM resumen_general
            WHERE ymd IS NOT NULL AND ymd > 0
            GROUP BY ymd
            ORDER BY ymd ASC
        `;
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
            w = `WHERE ymd BETWEEN '${i}' AND '${f}'`;
        }
        const qGen = `SELECT SUM(total_gestiones)::bigint as t FROM resumen_general ${w}`;
        const qCal = `SELECT AVG("FINAL") as c FROM resumen_calidad ${w}`;
        const qRisk = `SELECT (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as r FROM resumen_riesgo ${w}`;
        const qMot = `SELECT AVG(tiene_motivo) as m FROM resumen_motivo ${w}`;
        const qEmo = `SELECT AVG("TOTAL_EMOCION") as e FROM resumen_emocion ${w}`;
        const qPpm = `SELECT AVG("PPM_PROMEDIO") as p FROM resumen_ppm ${w}`;
        const [resGen, resCal, resRisk, resMot, resEmo, resPpm] = await Promise.all([
            pool.query(qGen), pool.query(qCal), pool.query(qRisk), pool.query(qMot), pool.query(qEmo), pool.query(qPpm)
        ]);
        res.json({ 
            total_llamadas: Number(resGen.rows[0].t || 0), 
            promedio_calidad: `${Number(resCal.rows[0].c || 0).toFixed(1)}%`,
            porcentaje_riesgo: `${Number(resRisk.rows[0].r || 0).toFixed(2)}%`,
            porcentaje_motivo: `${Number(resMot.rows[0].m || 0).toFixed(1)}%`,
            promedio_emocion: `${Number(resEmo.rows[0].e || 0).toFixed(1)}%`,
            promedio_ppm: Number(resPpm.rows[0].p || 0).toFixed(0)
        });
    } catch (e) { res.status(500).send(e.message); }
});

app.listen(8000, () => console.log('🚀 SERVIDOR HISTÓRICO - PUERTO 8000'));
