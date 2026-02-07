const express = require('express');
const router = express.Router();

const getFilters = (req) => {
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let f = [];
    // Ajuste a bigint (numérico)
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

const RISK_COLS = ["INSULTO", "RECLAMO", "INCUMPLIMIENTO", "EQUIVOCADO", "YA PAGO"];

router.get('/cumplimiento', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        // Atacamos a resumen_maestro
        const sel = RISK_COLS.map(c => `(SUM("${c}")::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "${c}"`).join(',');
        const q = `SELECT ${sel}, (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "FINAL" FROM resumen_maestro ${w}`;
        
        const r = await pool.query(q);
        const data = r.rows[0] || {};
        
        const resu = RISK_COLS.map(k => ({ 
            item: k, 
            promedio: Number(parseFloat(data[k] || 0).toFixed(2)) 
        }));
        resu.push({ item: "FINAL", promedio: Number(parseFloat(data.FINAL || 0).toFixed(2)) });
        
        res.json(resu);
    } catch (e) { 
        console.error("Error en riesgo cumplimiento:", e);
        res.status(500).send(e.message); 
    }
});

router.get('/evolucion', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        const sel = RISK_COLS.map(c => `(SUM("${c}")::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "${c}"`).join(',');
        
        // Cambio de tabla a resumen_maestro
        const q = `SELECT ymd::text as fecha, ${sel}, (SUM(tiene_riesgo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "FINAL" 
                  FROM resumen_maestro ${w} 
                  GROUP BY ymd ORDER BY ymd ASC`;
                  
        const r = await pool.query(q);
        res.json(r.rows);
    } catch (e) { 
        res.status(500).send(e.message); 
    }
});

module.exports = router;