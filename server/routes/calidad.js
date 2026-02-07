const express = require('express');
const router = express.Router();

// FILTRO ULTRA-SEGURO
const getFilters = (req) => {
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let f = [];
    
    if (inicio && fin && inicio !== '' && fin !== '') {
        f.push(`ymd BETWEEN ${inicio.replace(/-/g, '')} AND ${fin.replace(/-/g, '')}`);
    }

    if (empresas && empresas !== '') {
        f.push(`"EMPRESA" = ANY(string_to_array('${empresas}', ','))`);
    }
    if (ejecutivos && ejecutivos !== '') {
        f.push(`"NOMBRE_EJECUTIVO" = ANY(string_to_array('${ejecutivos}', ','))`);
    }
    if (contactos && contactos !== '') {
        f.push(`"CODIGO_CONTACTO" = ANY(string_to_array('${contactos}', ','))`);
    }

    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

const CAL_COLS = ["SALUDO", "TITULAR", "FAMILIAR", "PRESENTACION", "CORDIALIDAD", "RECADO", "EMPEX", "ENCARGO", "GRABADO", "INFORMACION", "MOTIVO", "OFERTA", "CANALES", "COPA", "DUDAS", "CIERRE"];

router.get('/cumplimiento', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        const sel = CAL_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        const q = `SELECT ${sel}, AVG(COALESCE("FINAL", 0)) as "FINAL" FROM resumen_maestro ${w}`;
        
        const r = await pool.query(q);
        
        // PARACAÍDAS: Si no hay datos, devolvemos ceros, NUNCA error
        if (!r.rows || r.rows.length === 0 || r.rows[0].FINAL === null) {
            const vacio = CAL_COLS.map(k => ({ item: k, promedio: 0 }));
            vacio.push({ item: "FINAL", promedio: 0 });
            return res.json(vacio);
        }

        const data = r.rows[0];
        const resu = CAL_COLS.map(k => ({ 
            item: k, 
            promedio: Math.round(parseFloat(data[k] || 0) * 10) / 10 
        }));
        resu.push({ item: "FINAL", promedio: Math.round(parseFloat(data.FINAL || 0) * 10) / 10 });
        
        res.json(resu);
    } catch (e) { 
        console.error("ERROR CRÍTICO CALIDAD:", e.message);
        // Devolvemos estructura mínima para que el front NO se ponga blanco
        res.json([]); 
    }
});

router.get('/evolucion', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        const sel = CAL_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        const q = `SELECT ymd as fecha, ${sel}, AVG(COALESCE("FINAL", 0)) as "FINAL" 
                  FROM resumen_maestro ${w} 
                  GROUP BY ymd ORDER BY ymd`;
        
        const r = await pool.query(q);
        res.json(r.rows || []);
    } catch (e) { 
        res.json([]); 
    }
});

module.exports = router;