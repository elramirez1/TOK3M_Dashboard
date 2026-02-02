TRUNCATE TABLE public.resumen_emocion;

INSERT INTO public.resumen_emocion (
    ymd, empresa, nombre_ejecutivo, codigo_contacto, total_gestiones, 
    "TRISTEZA", "MIEDO", "ENOJO", "ALIVIO", "PREOCUPACION", "TOTAL_EMOCION"
)
SELECT 
    "YMD", 
    "EMPRESA", 
    "NOMBRE_EJECUTIVO", 
    "CODIGO_CONTACTO", 
    SUM("cantidad") as total_gestiones,
    AVG("EvEmo_Tristeza"), 
    AVG("EvEmo_Miedo"), 
    AVG("EvEmo_Enojo"), 
    AVG("EvEmo_Alivio"), 
    AVG("EvEmo_Preocupacion"),
    AVG("EvEmo_Total")
FROM public.analisis_tokem
GROUP BY "YMD", "EMPRESA", "NOMBRE_EJECUTIVO", "CODIGO_CONTACTO";