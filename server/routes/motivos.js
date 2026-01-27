const express = require('express');
const router = express.Router();

const getFilters = (req) => {
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let f = [];
    if (inicio && fin) f.push(`ymd BETWEEN '${inicio.replace(/-/g, '')}' AND '${fin.replace(/-/g, '')}'`);
    const proc = (col, val) => {
        if (!val) return;
        f.push(`${col} = ANY(string_to_array('${val}', ','))`);
    };
    proc('empresa', empresas);
    proc('nombre_ejecutivo', ejecutivos);
    proc('codigo_contacto', contactos);
    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

const MOT_COLS = ["CESANTE", "SOBREENDEUDADO", "ENFERMEDAD", "DESCONOCE", "SINIESTRO", "FUERA PAIS", "OLVIDO", "FALLECIDO", "CATASTROFE", "NO QUIERE"];

router.get('/cumplimiento', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        // Promedio de cada motivo individual
        const sel = MOT_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        // El FINAL es el % de gestiones que tienen algún motivo (tiene_motivo * 100)
        const q = `SELECT ${sel}, (SUM(tiene_motivo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "FINAL" FROM resumen_motivo ${w}`;
        const r = await pool.query(q);
        const data = r.rows[0] || {};
        
        const resu = MOT_COLS.map(k => ({ 
            item: k, 
            promedio: Math.round(parseFloat(data[k] || 0) * 10) / 10 
        }));
        resu.push({ item: "FINAL", promedio: Math.round(parseFloat(data.FINAL || 0) * 10) / 10 });
        res.json(resu);
    } catch (e) { res.status(500).send(e.message); }
});

router.get('/evolucion', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        const sel = MOT_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        const q = `SELECT ymd as fecha, ${sel}, (SUM(tiene_motivo)::float / NULLIF(SUM(total_gestiones), 0)) * 100 as "FINAL" 
                  FROM resumen_motivo ${w} 
                  GROUP BY ymd ORDER BY ymd`;
        const r = await pool.query(q);
        res.json(r.rows);
    } catch (e) { res.status(500).send(e.message); }
});

module.exports = router;
