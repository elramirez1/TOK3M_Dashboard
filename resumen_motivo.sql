TRUNCATE TABLE public.resumen_motivo;

INSERT INTO public.resumen_motivo (
    ymd, empresa, nombre_ejecutivo, codigo_contacto, total_gestiones, 
    "CESANTE", "SOBREENDEUDADO", "ENFERMEDAD", "DESCONOCE", "SINIESTRO", 
    "FUERA PAIS", "OLVIDO", "FALLECIDO", "CATASTROFE", "NO QUIERE", "tiene_motivo"
)
SELECT 
    "YMD", 
    "EMPRESA", 
    "NOMBRE_EJECUTIVO", 
    "CODIGO_CONTACTO", 
    SUM("cantidad") as total_gestiones,
    AVG("EvMot_Cesante"), 
    AVG("EvMot_Sobreendeudado"), 
    AVG("EvMot_Enfermedad"), 
    AVG("EvMot_Desconoce"), 
    AVG("EvMot_Siniestro"), 
    AVG("EvMot_FueraPais"), 
    AVG("EvMot_Olvido"), 
    AVG("EvMot_Fallecido"), 
    AVG("EvMot_Catastrofe"), 
    AVG("EvMot_NoQuiere"),
    AVG("EvMot_Total")
FROM public.analisis_tokem
GROUP BY "YMD", "EMPRESA", "NOMBRE_EJECUTIVO", "CODIGO_CONTACTO";