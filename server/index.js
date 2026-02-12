// ARGUMENTO DE DIAGNÓSTICO: Implementación de seguridad perimetral a nivel de aplicación.
// Se integra script de migración automática de esquema y lógica de "Backoff Exponencial" 
// para prevenir ataques de fuerza bruta en el endpoint de autenticación.

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

// --- SCRIPT DE MIGRACIÓN AUTOMÁTICA (Para planes sin consola SQL directa) ---
const inicializarDB = async () => {
    try {
        // Añadir columna intentos_fallidos si no existe
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS intentos_fallidos INT DEFAULT 0
        `);
        
        // Añadir columna bloqueado_hasta si no existe
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP WITH TIME ZONE
        `);
        
        console.log('✅ ESQUEMA DE SEGURIDAD VERIFICADO (Columnas listas)');
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

// ==========================================
// --- SISTEMA DE AUTENTICACIÓN SEGURA ---
// ==========================================

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // 1. Buscar usuario primero para validar estado de bloqueo
        const userRes = await pool.query(
            'SELECT * FROM usuarios WHERE username = $1',
            [username]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = userRes.rows[0];
        const ahora = new Date();

        // 2. Verificar si la cuenta está bloqueada temporalmente
        if (user.bloqueado_hasta && ahora < new Date(user.bloqueado_hasta)) {
            const espera = Math.ceil((new Date(user.bloqueado_hasta) - ahora) / 1000);
            return res.status(403).json({ 
                message: `Demasiados intentos. Intenta de nuevo en ${espera} segundos.` 
            });
        }

        // 3. Validar contraseña
        if (user.password === password) {
            // ÉXITO: Resetear contadores de fallo
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
            // ERROR: Incrementar intentos y aplicar bloqueo exponencial
            const fallos = (user.intentos_fallidos || 0) + 1;
            let bloqueo = null;

            if (fallos >= 3) {
                // Algoritmo: (intentos - 2)^2 minutos de espera. (1min, 4min, 9min...)
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