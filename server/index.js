const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Usamos la URL interna de Railway que me pasaste
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nSZObCCpVqAnEDphEuZDORPeMyrFziwF@postgres.railway.internal:5432/railway',
    ssl: { rejectUnauthorized: false } 
});

app.set('pool', pool);
app.use(cors());
app.use(express.json());

// Endpoints básicos para mantener el Front vivo
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM("total_gestiones")::bigint as t FROM "resumen_maestro"');
        res.json({ total_llamadas: Number(result.rows[0].t || 0) });
    } catch (e) { res.json({ total_llamadas: 0 }); }
});

// Importar rutas (Asegúrate de que los archivos existan en server/routes/)
app.use('/api/resumen', require('./routes/resumen'));
app.use('/api/calidad', require('./routes/calidad'));
app.use('/api/riesgo', require('./routes/riesgo'));
app.use('/api/motivos', require('./routes/motivos'));
app.use('/api/emocion', require('./routes/emocion'));
app.use('/api/ppm', require('./routes/ppm'));
app.use('/api/textmining', require('./routes/textmining')); 
app.use('/api/cubo', require('./routes/cubo'));

// EL CAMBIO CLAVE: Escuchar en el puerto de Railway o 8000 como backup
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR ESTABLE EN PUERTO ${PORT}`);
});