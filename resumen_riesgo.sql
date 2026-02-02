TRUNCATE TABLE public.resumen_riesgo;

INSERT INTO public.resumen_riesgo (
    ymd, empresa, nombre_ejecutivo, codigo_contacto, total_gestiones, 
    "INSULTO", "RECLAMO", "INCUMPLIMIENTO", "EQUIVOCADO", "YA PAGO", "tiene_riesgo"
)
SELECT 
    "YMD", 
    "EMPRESA", 
    "NOMBRE_EJECUTIVO", 
    "CODIGO_CONTACTO", 
    SUM("cantidad") as total_gestiones,
    AVG("EvRisk_Insulto"), 
    AVG("EvRisk_Reclamo"), 
    AVG("EvRisk_Incumplimiento"), 
    AVG("EvRisk_Equivocado"), 
    AVG("EvRisk_YaPago"),
    AVG("EvRisk_Total")
FROM public.analisis_tokem
GROUP BY "YMD", "EMPRESA", "NOMBRE_EJECUTIVO", "CODIGO_CONTACTO";