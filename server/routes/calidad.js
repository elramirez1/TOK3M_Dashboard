const express = require('express');
const router = express.Router();

const getFilters = (req) => {
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let f = [];
    // Ajuste: ymd es bigint, quitamos comillas simples para optimizar la consulta
    if (inicio && fin) f.push(`ymd BETWEEN ${inicio.replace(/-/g, '')} AND ${fin.replace(/-/g, '')}`);
    const proc = (col, val) => {
        if (!val || val === 'null' || val === '') return;
        f.push(`${col} = ANY(string_to_array('${val}', ','))`);
    };
    proc('empresa', empresas);
    proc('nombre_ejecutivo', ejecutivos);
    proc('codigo_contacto', contactos);
    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

const CAL_COLS = ["SALUDO", "TITULAR", "FAMILIAR", "PRESENTACION", "CORDIALIDAD", "RECADO", "EMPEX", "ENCARGO", "GRABADO", "INFORMACION", "MOTIVO", "OFERTA", "CANALES", "COPA", "DUDAS", "CIERRE"];

router.get('/cumplimiento', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        // Ahora seleccionamos desde resumen_maestro
        const sel = CAL_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        const q = `SELECT ${sel}, AVG(COALESCE("FINAL", 0)) as "FINAL" FROM resumen_maestro ${w}`;
        
        const r = await pool.query(q);
        const data = r.rows[0] || {};
        const resu = CAL_COLS.map(k => ({ 
            item: k, 
            promedio: Math.round(parseFloat(data[k] || 0) * 10) / 10 
        }));
        resu.push({ item: "FINAL", promedio: Math.round(parseFloat(data.FINAL || 0) * 10) / 10 });
        res.json(resu);
    } catch (e) { 
        console.error("Error en calidad cumplimiento:", e);
        res.status(500).send(e.message); 
    }
});

router.get('/evolucion', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        const sel = CAL_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        // Cambio de tabla a resumen_maestro
        const q = `SELECT ymd as fecha, ${sel}, AVG(COALESCE("FINAL", 0)) as "FINAL" 
                  FROM resumen_maestro ${w} 
                  GROUP BY ymd ORDER BY ymd`;
        
        const r = await pool.query(q);
        res.json(r.rows);
    } catch (e) { 
        res.status(500).send(e.message); 
    }
});

module.exports = router;