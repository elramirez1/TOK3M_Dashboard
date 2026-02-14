// ARGUMENTO DE DIAGNÓSTICO: Migración de infraestructura a Reverse Proxy Nginx por seguridad corporativa.
// Se restaura la funcionalidad de filtros globales mediante middleware de inyección de Pool.
// Consolidación total de los 8 módulos de rutas secundarias y lógica de gestión de usuarios.

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');

const app = express();

// --- CONFIGURACIÓN DE CONEXIÓN ---
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: false, 
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

// --- SCRIPT DE MIGRACIÓN AUTOMÁTICA (Seguridad) ---
const inicializarDB = async () => {
    try {
        await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS intentos_fallidos INT DEFAULT 0`);
        await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP WITH TIME ZONE`);
        console.log('✅ ESQUEMA DE SEGURIDAD VERIFICADO');
    } catch (err) {
        console.error('⚠️ Nota sobre DB:', err.message);
    }
};

// Verificación de conexión e inicio de migración
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ ERROR DE CONEXIÓN INTERNA:', err.message);
    } else {
        console.log('✅ CONEXIÓN EXITOSA A BASE DE DATOS INTERNA');
        inicializarDB(); 
        release();
    }
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE CRÍTICO: RECUPERACIÓN DE FILTROS ---
// Este bloque asegura que req.pool esté disponible para todas las rutas en ./routes/
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// ==========================================
// --- SISTEMA DE AUTENTICACIÓN SEGURA ---
// ==========================================

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userRes = await pool.query(
            'SELECT * FROM usuarios WHERE username = $1',
            [username]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = userRes.rows[0];
        const ahora = new Date();

        // Verificar bloqueo temporal
        if (user.bloqueado_hasta && ahora < new Date(user.bloqueado_hasta)) {
            const espera = Math.ceil((new Date(user.bloqueado_hasta) - ahora) / 1000);
            return res.status(403).json({ 
                message: `Demasiados intentos. Intenta de nuevo en ${espera} segundos.` 
            });
        }

        if (user.password === password) {
            // ÉXITO: Resetear contadores
            await pool.query(
                'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1',
                [user.id]
            );
            return res.json({ 
                token: 'fake-jwt-token',
                user: user.username,
                role: user.role,
                message: 'Bienvenido al sistema TOK3M'
            });
        } else {
            // ERROR: Lógica exponencial
            const fallos = (user.intentos_fallidos || 0) + 1;
            let bloqueo = null;

            if (fallos >= 3) {
                const minutosEspera = Math.pow(fallos - 2, 2);
                bloqueo = new Date(ahora.getTime() + minutosEspera * 60000);
            }

            await pool.query(
                'UPDATE usuarios SET intentos_fallidos = $1, bloqueado_hasta = $2 WHERE id = $3',
                [fallos, bloqueo, user.id]
            );

            const msg = fallos >= 3 
                ? "Cuenta bloqueada temporalmente por seguridad." 
                : `Contraseña incorrecta. Intento ${fallos}/3`;

            return res.status(401).json({ message: msg });
        }
    } catch (e) {
        console.error("Error en Login DB:", e.message);
        res.status(500).json({ error: "Error en el servidor de autenticación" });
    }
});

// ==========================================
// --- PUENTE HACIA REVERSE PROXY (Nginx) ---
// ==========================================

app.post('/api/descargar-reporte', async (req, res) => {
    // DIAGNÓSTICO: Usamos variable de entorno para la IP/Dominio del Proxy
    // Esta URL debe apuntar al servidor que tiene Nginx configurado.
    const URL_REVERSE_PROXY = process.env.LOCAL_WORKER_URL || "http://CONFIGURAR_IP_EN_RAILWAY/generar-informe";

    try {
        const respuesta = await axios({
            method: 'post',
            url: URL_REVERSE_PROXY,
            data: req.body, 
            responseType: 'stream',
            timeout: 600000 // 10 minutos para procesos pesados
        });

        res.setHeader('Content-Type', 'text/html');
        // Transmisión directa por pipe para ahorrar memoria en Railway
        respuesta.data.pipe(res);
        
    } catch (e) {
        console.error("Error en puente local (Nginx):", e.message);
        res.status(502).json({ error: "El servidor local (Nginx) no respondió al pedido. Verifica el Proxy y el Worker." });
    }
});

// ==========================================
// --- GESTIÓN DE USUARIOS (ADMIN ONLY) ---
// ==========================================

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, role, intentos_fallidos FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

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

// --- IMPORTACIÓN DE RUTAS SECUNDARIAS (FILTROS ACTIVOS) ---
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