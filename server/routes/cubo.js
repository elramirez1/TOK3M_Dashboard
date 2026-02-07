const express = require('express');
const router = express.Router();

router.get('/data', async (req, res) => {
    const pool = req.app.get('pool');
    const { inicio, fin, empresas, ejecutivos, contactos } = req.query;

    let params = [];
    let conditions = [];
    
    // Filtro usando ymd (BigInt)
    if (inicio && fin) {
        conditions.push(`ymd BETWEEN $${params.length + 1} AND $${params.length + 2}`);
        params.push(parseInt(inicio.replace(/-/g, '')), parseInt(fin.replace(/-/g, '')));
    }
    
    if (empresas) {
        conditions.push(`empresa = ANY($${params.length + 1})`);
        params.push(empresas.split(','));
    }

    if (ejecutivos) {
        conditions.push(`nombre_ejecutivo = ANY($${params.length + 1})`);
        params.push(ejecutivos.split(','));
    }

    if (contactos) {
        conditions.push(`codigo_contacto = ANY($${params.length + 1})`);
        params.push(contactos.split(','));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // AQUÍ ESTÁ EL TRUCO: Mapeamos los nombres nuevos a los viejos usando "AS"
    const query = `
        SELECT 
            ymd as fecha_id, 
            empresa, 
            nombre_ejecutivo as ejecutivo, 
            codigo_contacto as contacto,
            total_gestiones,
            "SALUDO" as cal_saludo,
            "TITULAR" as cal_titular,
            "FAMILIAR" as cal_familiar,
            "PRESENTACION" as cal_presentacion,
            "CORDIALIDAD" as cal_cordialidad,
            "RECADO" as cal_recado,
            "EMPEX" as cal_empex,
            "ENCARGO" as cal_encargo,
            "GRABADO" as cal_grabado,
            "INFORMACION" as cal_informacion,
            "MOTIVO" as cal_motivo,
            "OFERTA" as cal_oferta,
            "CANALES" as cal_canales,
            "COPA" as cal_copa,
            "DUDAS" as cal_dudas,
            "CIERRE" as cal_cierre,
            "FINAL" as cal_nota_final,
            "INSULTO" as risk_insulto,
            "RECLAMO" as risk_reclamo,
            "INCUMPLIMIENTO" as risk_incumplimiento,
            "EQUIVOCADO" as risk_equivocado,
            "YA PAGO" as risk_ya_pago,
            tiene_riesgo,
            "CESANTE" as mot_cesante,
            "SOBREENDEUDADO" as mot_sobreendeudado,
            "ENFERMEDAD" as mot_enfermedad,
            "DESCONOCE" as mot_desconoce,
            "SINIESTRO" as mot_siniestro,
            "FUERA PAIS" as mot_fuera_pais,
            "OLVIDO" as mot_olvido,
            "FALLECIDO" as mot_fallecido,
            "CATASTROFE" as mot_catastrofe,
            "NO QUIERE" as mot_no_quiere,
            tiene_motivo,
            "TRISTEZA" as emo_tristeza,
            "MIEDO" as emo_miedo,
            "ENOJO" as emo_enojo,
            "ALIVIO" as emo_alivio,
            "PREOCUPACION" as emo_preocupacion,
            "TOTAL_EMOCION" as nivel_emocion,
            "PPM_PROMEDIO" as ppm
        FROM public.resumen_maestro
        ${whereClause}
        ORDER BY total_gestiones DESC
    `;

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (e) {
        console.error("ERROR CUBO DB:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;