const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({ user: 'danielramirezquintana', host: 'localhost', database: 'tokem_db', port: 5432 });

app.use(cors());
app.use(express.json());

// --- CORRECCIÓN DE RUTA DE LOGIN ---
// Cambiamos /api/login por /api/auth/login para que coincida con tu Frontend
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login solicitado en /api/auth/login para:', username);
    
    if (username === 'admin' && password === 'admin123') {
        return res.json({ token: 'fake-jwt-token', user: 'admin' });
    }
    return res.status(401).json({ message: 'Credenciales inválidas' });
});

// --- EL RESTO DE TUS ENDPOINTS ---
const RISK_COLS = ["INSULTO", "RECLAMO", "INCUMPLIMIENTO", "EQUIVOCADO", "YA PAGO"];
const CAL_COLS = ["SALUDO", "TITULAR", "FAMILIAR", "PRESENTACION", "CORDIALIDAD", "RECADO", "EMPEX", "ENCARGO", "GRABADO", "INFORMACION", "MOTIVO", "OFERTA", "CANALES", "COPA", "DUDAS", "CIERRE"];

const getFilters = (req) => {
    const { inicio, fin, empresas, codigos, ejecutivos } = req.query;
    let f = [];
    if (inicio && fin) f.push(`ymd BETWEEN '${inicio.replace(/-/g, '')}' AND '${fin.replace(/-/g, '')}'`);
    const proc = (col, val) => {
        if (!val) return;
        const a = Array.isArray(val) ? val : val.split(',');
        if (a.length > 0) f.push(`${col} IN (${a.map(v => "'"+v.trim()+"'").join(',')})`);
    };
    proc('empresa', empresas);
    proc('codigo_contacto', codigos);
    proc('nombre_ejecutivo', ejecutivos);
    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

app.get('/api/stats', async (req, res) => {
    try {
        const w = getFilters(req);
        const q = `SELECT SUM(total_gestiones)::bigint as t, AVG("FINAL") as c, (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as r FROM resumen_calidad_diario ${w}`;
        const r = await pool.query(q);
        res.json({ total_llamadas: Number(r.rows[0].t || 0), promedio_calidad: `${Number(r.rows[0].c || 0).toFixed(1)}%`, porcentaje_riesgo: `${Number(r.rows[0].r || 0).toFixed(2)}%` });
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/api/resumen/graficos', async (req, res) => {
    const w = getFilters(req);
    const [d, e, c, j] = await Promise.all([
        pool.query(`SELECT ymd as "FECHA", SUM(total_gestiones)::int as cantidad FROM resumen_calidad_diario ${w} GROUP BY ymd ORDER BY ymd`),
        pool.query(`SELECT empresa as "EMPRESA", SUM(total_gestiones)::int as cantidad FROM resumen_calidad_diario ${w} GROUP BY empresa ORDER BY cantidad DESC LIMIT 15`),
        pool.query(`SELECT codigo_contacto as "CODIGO_CONTACTO", SUM(total_gestiones)::int as cantidad FROM resumen_calidad_diario ${w} GROUP BY codigo_contacto ORDER BY cantidad DESC LIMIT 10`),
        pool.query(`SELECT nombre_ejecutivo as "NOMBRE_EJECUTIVO", SUM(total_gestiones)::int as cantidad FROM resumen_calidad_diario ${w} GROUP BY nombre_ejecutivo ORDER BY cantidad DESC LIMIT 25`)
    ]);
    res.json({ por_dia: d.rows, por_empresa: e.rows, por_contacto: c.rows, por_ejecutivo: j.rows });
});

app.get('/api/riesgo/cumplimiento', async (req, res) => {
    const w = getFilters(req);
    const sel = RISK_COLS.map(c => `(SUM("${c}")::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "${c}"`).join(',');
    const r = await pool.query(`SELECT ${sel}, (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "FINAL" FROM resumen_calidad_diario ${w}`);
    const resu = RISK_COLS.map(k => ({ item: k, promedio: Number(parseFloat(r.rows[0][k] || 0).toFixed(2)) }));
    resu.push({ item: "FINAL", promedio: Number(parseFloat(r.rows[0].FINAL || 0).toFixed(2)) });
    res.json(resu);
});

app.get('/api/riesgo/evolucion', async (req, res) => {
    const w = getFilters(req);
    const sel = RISK_COLS.map(c => `(SUM("${c}")::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "${c}"`).join(',');
    const r = await pool.query(`SELECT ymd as fecha, ${sel}, (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "FINAL" FROM resumen_calidad_diario ${w} GROUP BY ymd ORDER BY ymd`);
    const formatted = r.rows.map(row => {
        const newRow = { fecha: row.fecha };
        Object.keys(row).forEach(key => { if(key !== 'fecha') newRow[key] = Number(parseFloat(row[key] || 0).toFixed(2)); });
        return newRow;
    });
    res.json(formatted);
});

app.get('/api/calidad/cumplimiento', async (req, res) => {
    const w = getFilters(req);
    const sel = CAL_COLS.map(c => `AVG("${c}") as "${c}"`).join(',');
    const r = await pool.query(`SELECT ${sel}, AVG("FINAL") as "FINAL" FROM resumen_calidad_diario ${w}`);
    const resu = CAL_COLS.map(k => ({ item: k, promedio: Math.round(parseFloat(r.rows[0][k] || 0) * 10) / 10 }));
    resu.push({ item: "FINAL", promedio: Math.round(parseFloat(r.rows[0].FINAL || 0) * 10) / 10 });
    res.json(resu);
});

app.get('/api/calidad/evolucion', async (req, res) => {
    const w = getFilters(req);
    const sel = CAL_COLS.map(c => `AVG("${c}") as "${c}"`).join(',');
    const r = await pool.query(`SELECT ymd as fecha, ${sel}, AVG("FINAL") as "FINAL" FROM resumen_calidad_diario ${w} GROUP BY ymd ORDER BY ymd`);
    res.json(r.rows);
});

app.listen(8000, () => console.log('🚀 SERVIDOR CORREGIDO EN PUERTO 8000'));
