const express = require('express');
const router = express.Router();

router.get('/data', async (req, res) => {
    const pool = req.app.get('pool');
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let filters = [];

    if (inicio && fin && inicio !== '' && fin !== '') {
        const i = parseInt(inicio.replace(/-/g, ''));
        const f = parseInt(fin.replace(/-/g, ''));
        if (!isNaN(i) && !isNaN(f)) filters.push(`ymd BETWEEN ${i} AND ${f}`);
    }
    
    if (empresas) filters.push(`empresa = ANY(string_to_array('${empresas}', ','))`);
    if (ejecutivos) filters.push(`nombre_ejecutivo = ANY(string_to_array('${ejecutivos}', ','))`);
    if (contactos) filters.push(`codigo_contacto = ANY(string_to_array('${contactos}', ','))`);

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    try {
        const [resEvolucion, resEjecutivos, resEmpresas, resSegmentos] = await Promise.all([
            pool.query(`SELECT ymd::text as "FECHA", AVG("PPM_PROMEDIO") as "PPM" FROM resumen_ppm ${where} GROUP BY ymd ORDER BY ymd`),
            pool.query(`SELECT nombre_ejecutivo as "NOMBRE_EJECUTIVO", AVG("PPM_PROMEDIO") as "PPM" FROM resumen_ppm ${where} GROUP BY nombre_ejecutivo ORDER BY "PPM" DESC`),
            pool.query(`SELECT empresa as "EMPRESA", AVG("PPM_PROMEDIO") as "PPM" FROM resumen_ppm ${where} GROUP BY empresa ORDER BY "PPM" DESC`),
            pool.query(`
                SELECT 
                    CASE 
                        WHEN "PPM_PROMEDIO" < 120 THEN 'Lento'
                        WHEN "PPM_PROMEDIO" BETWEEN 120 AND 160 THEN 'Normal'
                        WHEN "PPM_PROMEDIO" BETWEEN 161 AND 200 THEN 'Rápido'
                        ELSE 'Muy rápido'
                    END as "segmento",
                    COUNT(*) as "cantidad"
                FROM resumen_ppm 
                ${where}
                GROUP BY 1
            `)
        ]);

        const totalPpm = resEvolucion.rows.reduce((acc, curr) => acc + Number(curr.PPM || 0), 0);
        const avgGlobal = resEvolucion.rows.length > 0 ? (totalPpm / resEvolucion.rows.length) : 0;

        res.json({ 
            stats: { ppm_avg: avgGlobal },
            evolucion: resEvolucion.rows,
            por_ejecutivo: resEjecutivos.rows,
            por_empresa: resEmpresas.rows,
            segmentos: resSegmentos.rows
        });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

module.exports = router;
