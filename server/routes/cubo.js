const express = require('express');
const router = express.Router();

router.get('/data', async (req, res) => {
    const pool = req.app.get('pool');
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;

    let params = [];
    let conditions = [];
    
    // Filtro de fecha (Usa la columna indexada fecha_id)
    if (inicio && fin) {
        conditions.push(`fecha_id BETWEEN $${params.length + 1} AND $${params.length + 2}`);
        params.push(inicio.replace(/-/g, ''), fin.replace(/-/g, ''));
    }
    
    if (empresas) {
        conditions.push(`empresa = ANY($${params.length + 1})`);
        params.push(empresas.split(','));
    }

    if (ejecutivos) {
        conditions.push(`ejecutivo = ANY($${params.length + 1})`);
        params.push(ejecutivos.split(','));
    }

    if (contactos) {
        conditions.push(`contacto = ANY($${params.length + 1})`);
        params.push(contactos.split(','));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Consultamos la tabla física: MUCHO más rápido que procesar la tabla original
    const query = `
        SELECT * FROM public.resumen_cubo_fisico
        ${whereClause}
        ORDER BY total_gestiones DESC
    `;

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (e) {
        console.error("ERROR CUBO DB:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;