const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Usamos la URL que ya tienes en variables
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
});

// --- DIAGNÓSTICO DE BASE DE DATOS ---
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ ERROR CRÍTICO DE CONEXIÓN A DB:', err.stack);
    } else {
        console.log('✅ CONEXIÓN EXITOSA A POSTGRESQL EN RAILWAY');
        release();
    }
});

app.use(cors());
app.use(express.json());
app.set('pool', pool);

// Endpoint de Stats (Si este da datos, el resto funcionará)
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as conteo FROM "resumen_maestro"');
        console.log(`📊 Filas encontradas en DB: ${result.rows[0].conteo}`);
        
        const mainQuery = await pool.query('SELECT SUM("total_gestiones")::bigint as t, AVG("FINAL") as c FROM "resumen_maestro"');
        const data = mainQuery.rows[0];
        
        res.json({ 
            total_llamadas: Number(data.t || 0), 
            promedio_calidad: `${Number(data.c || 0).toFixed(1)}%`
        });
    } catch (e) { 
        console.error('❌ Error en consulta /api/stats:', e.message);
        res.json({ total_llamadas: 0, error: e.message }); 
    }
});

// Mantener las rutas activas
app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining')); 
app.use('/api/cubo', require('./routes/cubo'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR ESCUCHANDO EN PUERTO ${PORT}`);
});