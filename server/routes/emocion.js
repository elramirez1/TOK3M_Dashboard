const express = require('express');
const router = express.Router();

const getFilters = (req) => {
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let f = [];
    // Ajuste: ymd como bigint (sin comillas)
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

// Estas columnas coinciden con los alias en resumen_maestro
const EMO_COLS = ["TRISTEZA", "MIEDO", "ENOJO", "ALIVIO", "PREOCUPACION"];

router.get('/cumplimiento', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        const sel = EMO_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        
        // Cambio a resumen_maestro
        const q = `SELECT ${sel}, AVG("TOTAL_EMOCION") as "FINAL" FROM resumen_maestro ${w}`;
        
        const r = await pool.query(q);
        const data = r.rows[0] || {};
        
        const resu = EMO_COLS.map(k => ({ 
            item: k, 
            promedio: Math.round(parseFloat(data[k] || 0) * 100) / 100 
        }));
        resu.push({ item: "FINAL", promedio: Math.round(parseFloat(data.FINAL || 0) * 100) / 100 });
        res.json(resu);
    } catch (e) { 
        console.error("Error en emocion cumplimiento:", e);
        res.status(500).send(e.message); 
    }
});

router.get('/evolucion', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        const sel = EMO_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        
        // Cambio a resumen_maestro
        const q = `SELECT ymd as fecha, ${sel}, AVG("TOTAL_EMOCION") as "FINAL" 
                  FROM resumen_maestro ${w} 
                  GROUP BY ymd ORDER BY ymd`;
                  
        const r = await pool.query(q);
        res.json(r.rows);
    } catch (e) { 
        res.status(500).send(e.message); 
    }
});

module.exports = router;