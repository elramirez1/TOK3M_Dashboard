const express = require('express');
const router = express.Router();

router.get('/graficos', async (req, res) => {
    const pool = req.app.get('pool');
    // 1. Capturamos 'contactos' desde la query
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let filters = [];

    if (inicio && fin) filters.push(`ymd BETWEEN '${inicio.replace(/-/g, '')}' AND '${fin.replace(/-/g, '')}'`);
    if (empresas) filters.push(`empresa = ANY(string_to_array('${empresas}', ','))`);
    if (ejecutivos) filters.push(`nombre_ejecutivo = ANY(string_to_array('${ejecutivos}', ','))`);
    
    // 2. Añadimos el filtro de contactos a la consulta SQL
    if (contactos) filters.push(`codigo_contacto = ANY(string_to_array('${contactos}', ','))`);

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    try {
        const [dia, eje, emp, con] = await Promise.all([
            pool.query(`SELECT ymd as "FECHA", SUM(total_gestiones) as "cantidad" FROM resumen_general ${where} GROUP BY ymd ORDER BY ymd`),
            pool.query(`SELECT nombre_ejecutivo as "NOMBRE_EJECUTIVO", SUM(total_gestiones) as "cantidad" FROM resumen_general ${where} GROUP BY nombre_ejecutivo`),
            pool.query(`SELECT empresa as "EMPRESA", SUM(total_gestiones) as "cantidad" FROM resumen_general ${where} GROUP BY empresa`),
            pool.query(`SELECT codigo_contacto as "CODIGO_CONTACTO", SUM(total_gestiones) as "cantidad" FROM resumen_general ${where} GROUP BY codigo_contacto`)
        ]);
        res.json({ 
            por_dia: dia.rows, 
            por_ejecutivo: eje.rows, 
            por_empresa: emp.rows, 
            por_contacto: con.rows 
        });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

module.exports = router;
