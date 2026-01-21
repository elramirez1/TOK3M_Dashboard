const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8000;
const SECRET = 'TOKEM_SECRET_2024_KEY_99';

app.use(helmet());
app.use(cors());
app.use(express.json());

const db = new (require("sqlite3").verbose()).Database('/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db');
const dbUsers = new (require("sqlite3").verbose()).Database('./users.db');

// Función helper para convertir db.all en Promesa (Velocidad)
const query = (sql, params = []) => new Promise((res, rej) => {
    db.all(sql, params, (err, rows) => err ? rej(err) : res(rows));
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token" });
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido" });
        req.user = user;
        next();
    });
};

const buildWhere = (q) => {
    let f = [];
    if (q.inicio && q.fin) f.push(`YMD BETWEEN '${q.inicio.replace(/-/g, '')}' AND '${q.fin.replace(/-/g, '')}'`);
    const addFilter = (param, col) => {
        if (q[param]) {
            const vals = Array.isArray(q[param]) ? q[param] : [q[param]];
            if (vals.length > 0) f.push(`${col} IN (${vals.map(v => `'${v}'`).join(',')})`);
        }
    };
    addFilter('empresas', 'EMPRESA');
    addFilter('codigos', 'CODIGO_CONTACTO');
    addFilter('ejecutivos', 'NOMBRE_EJECUTIVO');
    return f.length > 0 ? "WHERE " + f.join(" AND ") : "";
};

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    dbUsers.get("SELECT * FROM usuarios WHERE username = ?", [username], (err, user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '8h' });
            res.json({ token, username: user.username });
        } else { res.status(401).json({ error: "Credenciales" }); }
    });
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    const row = await query("SELECT SUM(cantidad) as total, AVG(EvCal_Final) as promedio FROM ANALISIS_TOK3M");
    res.json({ total_llamadas: row[0].total || 0, promedio_calidad: `${(row[0].promedio || 0).toFixed(1)}%` });
});

app.get('/api/resumen/graficos', authenticateToken, async (req, res) => {
    const where = buildWhere(req.query);
    try {
        // Ejecución en PARALELO
        const [dia, emp, con, eje] = await Promise.all([
            query(`SELECT YMD as FECHA, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M ${where} GROUP BY YMD ORDER BY YMD`),
            query(`SELECT EMPRESA, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M ${where} GROUP BY EMPRESA ORDER BY cantidad DESC LIMIT 15`),
            query(`SELECT CODIGO_CONTACTO, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M ${where} GROUP BY CODIGO_CONTACTO ORDER BY cantidad DESC`),
            query(`SELECT NOMBRE_EJECUTIVO, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M ${where} GROUP BY NOMBRE_EJECUTIVO ORDER BY cantidad DESC LIMIT 20`)
        ]);
        res.json({ por_dia: dia, por_empresa: emp, por_contacto: con, por_ejecutivo: eje });
    } catch (e) { res.status(500).send(e.message); }
});

const COLS_CAL = ["Saludo", "Titular", "Familiar", "Presentacion", "Cordialidad", "Recado", "Empex", "Encargo", "Grabado", "Informacion", "Motivo", "Oferta", "Canales", "Copa", "Dudas", "Cierre"];

app.get('/api/calidad/cumplimiento', authenticateToken, async (req, res) => {
    const where = buildWhere(req.query);
    const sel = COLS_CAL.map(c => `AVG(EvCal_${c}) as ${c.toUpperCase()}`).join(', ');
    const row = await query(`SELECT ${sel}, AVG(EvCal_Final) as FINAL FROM ANALISIS_TOK3M INDEXED BY idx_ymd ${where}`);
    const barras = COLS_CAL.map(c => ({ item: c.toUpperCase(), promedio: Math.round(row[0][c.toUpperCase()] || 0) }));
    barras.push({ item: 'FINAL', promedio: Math.round(row[0].FINAL || 0) });
    res.json(barras);
});

app.get('/api/calidad/evolucion', authenticateToken, (req, res) => {
    const where = buildWhere(req.query);
    const sel = COLS_CAL.map(c => `AVG(EvCal_${c}) as ${c.toUpperCase()}`).join(', ');
    db.all(`SELECT YMD as fecha, ${sel}, AVG(EvCal_Final) as FINAL FROM ANALISIS_TOK3M INDEXED BY idx_ymd ${where} GROUP BY YMD ORDER BY YMD`, (err, rows) => {
        res.json(rows || []);
    });
});

app.listen(PORT, () => console.log(`Servidor Optimizado en puerto ${PORT}`));
