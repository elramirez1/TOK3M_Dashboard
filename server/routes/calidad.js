const express = require('express');
const router = express.Router();

const getFilters = (req) => {
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;
    let f = [];
    
    // Filtro de fechas (ymd es bigint)
    if (inicio && fin && inicio !== '' && fin !== '') {
        f.push(`ymd BETWEEN ${inicio.replace(/-/g, '')} AND ${fin.replace(/-/g, '')}`);
    }

    // IMPORTANTE: Nombres de columnas con comillas dobles para PostgreSQL
    const proc = (col, val) => {
        if (!val || val === 'null' || val === '' || val === 'undefined') return;
        // Agregamos comillas dobles a la columna para que coincida con la tabla
        f.push(`"${col}" = ANY(string_to_array('${val}', ','))`);
    };

    // Ajustamos los nombres de columnas a MAYÚSCULAS para que coincidan con tu tabla
    proc('EMPRESA', empresas);
    proc('NOMBRE_EJECUTIVO', ejecutivos);
    proc('CODIGO_CONTACTO', contactos);

    return f.length > 0 ? ' WHERE ' + f.join(' AND ') : '';
};

const CAL_COLS = ["SALUDO", "TITULAR", "FAMILIAR", "PRESENTACION", "CORDIALIDAD", "RECADO", "EMPEX", "ENCARGO", "GRABADO", "INFORMACION", "MOTIVO", "OFERTA", "CANALES", "COPA", "DUDAS", "CIERRE"];

router.get('/cumplimiento', async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const w = getFilters(req);
        
        // Seleccionamos promedios asegurando que FINAL también esté protegido
        const sel = CAL_COLS.map(c => `AVG(COALESCE("${c}", 0)) as "${c}"`).join(',');
        const q = `SELECT ${sel}, AVG(COALESCE("FINAL", 0)) as "FINAL" FROM resumen_maestro ${w}`;
        
        const r = await pool.query(q);
        
        // Si no hay filas, devolvemos array de ceros para que el front no muera
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
        console.error("Error en calidad cumplimiento:", e);
        // Enviamos un array vacío en lugar de un error de texto para no romper el .map del front
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
        console.error("Error en calidad evolucion:", e);
        res.json([]); 
    }
});

module.exports = router;