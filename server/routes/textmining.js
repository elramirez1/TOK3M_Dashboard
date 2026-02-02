const express = require('express');
const router = express.Router();

const getFilters = (req) => {
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let f = [];
    if (inicio && fin) {
        const i = inicio.replace(/-/g, '');
        const f_date = fin.replace(/-/g, '');
        f.push(`"YMD" BETWEEN '${i}' AND '${f_date}'`);
    }
    
    const proc = (col, val) => {
        if (!val) return;
        f.push(`"${col.toUpperCase()}" = ANY(string_to_array('${val}', ','))`);
    };
    
    proc('empresa', empresas);
    proc('codigo_contacto', contactos);
    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

router.get('/data', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        const q = `SELECT palabra as word, SUM(conteo)::int as count FROM resumen_textmining ${w} GROUP BY palabra ORDER BY count DESC LIMIT 100`;
        const r = await pool.query(q);
        res.json(r.rows);
    } catch (e) { 
        res.status(500).send(e.message); 
    }
});

module.exports = router;
