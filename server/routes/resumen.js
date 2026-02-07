const express = require('express');
const router = express.Router();

router.get('/graficos', async (req, res) => {
    const pool = req.app.get('pool');
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let filters = [];

    // Filtros ajustados a la nueva estructura
    if (inicio && fin) filters.push(`ymd BETWEEN ${inicio.replace(/-/g, '')} AND ${fin.replace(/-/g, '')}`);
    if (empresas) filters.push(`empresa = ANY(string_to_array('${empresas}', ','))`);
    
    // IMPORTANTE: nombre_ejecutivo y codigo_contacto son los nombres en la tabla maestro
    if (ejecutivos) filters.push(`nombre_ejecutivo = ANY(string_to_array('${ejecutivos}', ','))`);
    if (contactos) filters.push(`codigo_contacto = ANY(string_to_array('${contactos}', ','))`);

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    try {
        // Ahora todas las consultas atacan a resumen_maestro
        const [dia, eje, emp, con] = await Promise.all([
            pool.query(`SELECT ymd as "FECHA", SUM(total_gestiones) as "cantidad" FROM resumen_maestro ${where} GROUP BY ymd ORDER BY ymd`),
            pool.query(`SELECT nombre_ejecutivo as "NOMBRE_EJECUTIVO", SUM(total_gestiones) as "cantidad" FROM resumen_maestro ${where} GROUP BY nombre_ejecutivo`),
            pool.query(`SELECT empresa as "EMPRESA", SUM(total_gestiones) as "cantidad" FROM resumen_maestro ${where} GROUP BY empresa`),
            pool.query(`SELECT codigo_contacto as "CODIGO_CONTACTO", SUM(total_gestiones) as "cantidad" FROM resumen_maestro ${where} GROUP BY codigo_contacto`)
        ]);
        
        res.json({ 
            por_dia: dia.rows, 
            por_ejecutivo: eje.rows, 
            por_empresa: emp.rows, 
            por_contacto: con.rows 
        });
    } catch (e) { 
        console.error("Error en router resumen:", e);
        res.status(500).json({ error: e.message }); 
    }
});

module.exports = router;