const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const pool = new Pool({ user: 'danielramirezquintana', host: 'localhost', database: 'tokem_db', port: 5432 });

app.use(cors());
app.use(express.json());

const SECRET = 'TOKEM_SECRET_2024_KEY_99';
const CAL_COLS = ["SALUDO", "TITULAR", "FAMILIAR", "PRESENTACION", "CORDIALIDAD", "RECADO", "EMPEX", "ENCARGO", "GRABADO", "INFORMACION", "MOTIVO", "OFERTA", "CANALES", "COPA", "DUDAS", "CIERRE"];

const getFilters = (req) => {
    const { inicio, fin, codigos, empresas, ejecutivos } = req.query;
    let f = [];
    if (inicio && fin) f.push(`ymd BETWEEN '${inicio.replace(/-/g, '')}' AND '${fin.replace(/-/g, '')}'`);
    const proc = (col, val) => {
        if (!val) return;
        const a = Array.isArray(val) ? val : val.split(',');
        if (a.length > 0) f.push(`${col} IN (${a.map(v => "'"+v.trim()+"'").join(',')})`);
    };
    proc('codigo_contacto', codigos);
    proc('empresa', empresas);
    proc('nombre_ejecutivo', ejecutivos);
    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const r = await pool.query("SELECT * FROM usuarios WHERE username = $1", [username]);
    if (r.rows[0] && bcrypt.compareSync(password, r.rows[0].password)) {
        const token = jwt.sign({ id: r.rows[0].id, username: r.rows[0].username }, SECRET, { expiresIn: '8h' });
        res.json({ token, username: r.rows[0].username });
    } else { res.status(401).json({ error: "Inválido" }); }
});

app.get('/api/stats', async (req, res) => {
    const w = getFilters(req);
    const r = await pool.query(`SELECT SUM(total_gestiones)::bigint as total, AVG("FINAL") as promedio FROM resumen_calidad_diario ${w}`);
    res.json({ total_llamadas: Number(r.rows[0].total || 0), promedio_calidad: `${Number(r.rows[0].promedio || 0).toFixed(1)}%` });
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
    // VOLVEMOS A YMD para que el gráfico tenga puntos, pero con la velocidad de la vista materializada
    const sel = CAL_COLS.map(c => `AVG("${c}") as "${c}"`).join(',');
    const r = await pool.query(`SELECT ymd as fecha, ${sel}, AVG("FINAL") as "FINAL" FROM resumen_calidad_diario ${w} GROUP BY ymd ORDER BY ymd`);
    res.json(r.rows);
});

app.listen(8000, () => console.log('🚀 CALIDAD RESTAURADA CON GRÁFICOS'));
