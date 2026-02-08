const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Usamos la URL que ya sabemos que conecta
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: { rejectUnauthorized: false } 
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// Endpoints mínimos
app.get('/api/health', (req, res) => res.send('OK'));

app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t FROM "resumen_maestro"');
        res.json({ total_llamadas: Number(result.rows[0].t || 0) });
    } catch (e) { res.json({ total_llamadas: 0 }); }
});

// Restaurar el resto de las rutas para evitar el error del Front
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining')); 
app.use('/api/cubo', require('./routes/cubo'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BACKEND ONLINE EN PUERTO ${PORT}`);
});