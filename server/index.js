// ARGUMENTO DE DIAGNÓSTICO: Migración de autenticación estática a dinámica mediante PostgreSQL y habilitación de CRUD de usuarios.
// Se mantiene la infraestructura de Railway y se expande la API para gestión administrativa.

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- CONFIGURACIÓN DE CONEXIÓN ---
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
// --- SISTEMA DE AUTENTICACIÓN DINÁMICA ---
// ==========================================

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT username, role FROM usuarios WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            return res.json({ 
                token: 'fake-jwt-token', // En el futuro podrías usar JWT real aquí
                user: user.username,
                role: user.role,
                message: 'Bienvenido al sistema TOK3M'
            });
        }
        return res.status(401).json({ message: 'Credenciales inválidas' });
    } catch (e) {
        console.error("Error en Login DB:", e.message);
        res.status(500).json({ error: "Error en el servidor de autenticación" });
    }
});

// ==========================================
// --- GESTIÓN DE USUARIOS (ADMIN ONLY) ---
// ==========================================

// Listar todos los usuarios
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, role FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Crear nuevo usuario
app.post('/api/users', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        await pool.query(
            'INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3)',
            [username, password, role || 'user']
        );
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Eliminar usuario por ID
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// --- ENDPOINTS DE DATOS Y DASHBOARD ---
// ==========================================

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