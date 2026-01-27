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

const MOTIVOS_COLS = ["CESANTE", "SOBREENDEUDADO", "ENFERMEDAD", "DESCONOCE", "SINIESTRO", "FUERA_PAIS", "OLVIDO", "FALLECIDO", "CATASTROFE", "NO_QUIERE"];

// Endpoint: Distribución de Motivos (Desde tabla resumen_motivos)
router.get('/distribucion', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        // Calculamos el promedio de cada motivo (incidencia)
        const sel = MOTIVOS_COLS.map(c => `AVG("${c}") as "${c}"`).join(',');
        const q = `SELECT ${sel} FROM resumen_motivos ${w}`;
        
        const r = await pool.query(q);
        
        // Transformamos para el gráfico del Frontend (multiplicando por 100 para porcentaje)
        const resu = MOTIVOS_COLS.map(k => ({ 
            motivo: k, 
            porcentaje: Number((parseFloat(r.rows[0][k] || 0) * 100).toFixed(2)) 
        })).sort((a, b) => b.porcentaje - a.porcentaje); // Ordenar de mayor a menor incidencia
        
        res.json(resu);
    } catch (e) { res.status(500).send(e.message); }
});

module.exports = router;
