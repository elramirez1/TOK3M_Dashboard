const express = require('express');
const router = express.Router();

// ESTA ES LA CLAVE: Busca en toda la tabla, no solo el top
router.get('/audit', async (req, res) => {
    const pool = req.app.get('pool');
    const { word } = req.query;
    
    if (!word) return res.json({ count: 0, rank: 'N/A' });

    try {
        const query = `
            WITH RankedWords AS (
                SELECT 
                    palabra, 
                    SUM(conteo) as total_count,
                    ROW_NUMBER() OVER (ORDER BY SUM(conteo) DESC) as ranking
                FROM RESUMEN_TEXTMINING
                GROUP BY palabra
            )
            SELECT total_count, ranking 
            FROM RankedWords 
            WHERE LOWER(palabra) = LOWER($1)
        `;
        
        const result = await pool.query(query, [word.trim()]);

        if (result.rows.length > 0) {
            res.json({
                word: word.toUpperCase(),
                count: parseInt(result.rows[0].total_count),
                rank: parseInt(result.rows[0].ranking)
            });
        } else {
            res.json({ count: 0, rank: 'N/A' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/data', async (req, res) => {
    const pool = req.app.get('pool');
    try {
        const result = await pool.query(`
            SELECT palabra as word, SUM(conteo) as count 
            FROM RESUMEN_TEXTMINING 
            GROUP BY palabra 
            ORDER BY count DESC 
            LIMIT 500
        `);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
