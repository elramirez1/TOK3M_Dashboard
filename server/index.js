const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const pool = new Pool({ user: 'danielramirezquintana', host: 'localhost', database: 'tokem_db', port: 5432 });

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// --- LOGIN ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') return res.json({ token: 'fake-jwt-token', user: 'admin' });
    return res.status(401).json({ message: 'Credenciales inválidas' });
});

// --- IMPORTAR RUTAS ---
const resumenRoutes = require('./routes/resumen');
const calidadRoutes = require('./routes/calidad');
const riesgoRoutes = require('./routes/riesgo');
const motivosRoutes = require('./routes/motivos');

app.use('/api/resumen', resumenRoutes);
app.use('/api/calidad', calidadRoutes);
app.use('/api/riesgo', riesgoRoutes);
app.use('/api/motivos', motivosRoutes);

// --- ENDPOINT PARA FILTROS ---
app.get('/api/filtros', async (req, res) => {
    try {
        const empresas = await pool.query('SELECT DISTINCT empresa FROM resumen_general ORDER BY empresa');
        const ejecutivos = await pool.query('SELECT DISTINCT nombre_ejecutivo FROM resumen_general ORDER BY nombre_ejecutivo');
        const codigos = await pool.query('SELECT DISTINCT codigo_contacto FROM resumen_general ORDER BY codigo_contacto');
        
        res.json({
            empresas: empresas.rows.map(r => r.empresa),
            ejecutivos: ejecutivos.rows.map(r => r.nombre_ejecutivo),
            codigos: codigos.rows.map(r => r.codigo_contacto)
        });
    } catch (e) { res.status(500).send(e.message); }
});

// --- STATS DE CABECERA ---
app.get('/api/stats', async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        let w = '';
        if (inicio && fin) w = `WHERE ymd BETWEEN '${inicio.replace(/-/g, '')}' AND '${fin.replace(/-/g, '')}'`;
        
        const qGen = `SELECT SUM(total_gestiones)::bigint as t FROM resumen_general ${w}`;
        const qCal = `SELECT AVG("FINAL") as c FROM resumen_calidad ${w}`;
        const qRisk = `SELECT (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as r FROM resumen_riesgo ${w}`;
        
        const [resGen, resCal, resRisk] = await Promise.all([
            pool.query(qGen),
            pool.query(qCal),
            pool.query(qRisk)
        ]);

        res.json({ 
            total_llamadas: Number(resGen.rows[0].t || 0), 
            promedio_calidad: `${Number(resCal.rows[0].c || 0).toFixed(1)}%`,
            porcentaje_riesgo: `${Number(resRisk.rows[0].r || 0).toFixed(2)}%`
        });
    } catch (e) { res.status(500).send(e.message); }
});

app.listen(8000, () => console.log('🚀 SERVIDOR COMPLETO EN PUERTO 8000'));
