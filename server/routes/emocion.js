const express = require('express');
const router = express.Router();

const getFilters = (req) => {
    const { inicio, fin, empresas, codigos, ejecutivos } = req.query;
    let f = [];
    if (inicio && fin) f.push(`ymd BETWEEN '${inicio.replace(/-/g, '')}' AND '${fin.replace(/-/g, '')}'`);
    const proc = (col, val) => {
        if (!val) return;
        const a = Array.isArray(val) ? val : val.split(',');
        if (a.length > 0) f.push(`${col} IN (${a.map(v => "'"+v.trim()+"'").join(',')})`);
    };
    proc('empresa', empresas); proc('codigo_contacto', codigos); proc('nombre_ejecutivo', ejecutivos);
    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

const EMO_COLS = ["TRISTEZA", "MIEDO", "ENOJO", "ALIVIO", "PREOCUPACION"];

// Endpoint: Análisis de Emociones (Desde tabla resumen_emocion)
router.get('/analisis', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        // Calculamos el promedio de cada emoción
        const sel = EMO_COLS.map(c => `AVG("${c}") as "${c}"`).join(',');
        const q = `SELECT ${sel} FROM resumen_emocion ${w}`;
        
        const r = await pool.query(q);
        
        // Formateamos para que el Frontend reciba etiquetas y valores claros
        const resu = EMO_COLS.map(k => ({ 
            emocion: k, 
            nivel: Number((parseFloat(r.rows[0][k] || 0) * 100).toFixed(2)) 
        }));
        
        res.json(resu);
    } catch (e) { res.status(500).send(e.message); }
});

module.exports = router;
