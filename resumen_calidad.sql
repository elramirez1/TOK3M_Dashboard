TRUNCATE TABLE public.resumen_calidad;

INSERT INTO public.resumen_calidad (
    ymd, empresa, nombre_ejecutivo, codigo_contacto, total_gestiones, 
    "SALUDO", "TITULAR", "FAMILIAR", "PRESENTACION", "CORDIALIDAD", 
    "RECADO", "EMPEX", "ENCARGO", "GRABADO", "INFORMACION", 
    "MOTIVO", "OFERTA", "CANALES", "COPA", "DUDAS", "CIERRE", "FINAL"
)
SELECT 
    "YMD", 
    "EMPRESA", 
    "NOMBRE_EJECUTIVO", 
    "CODIGO_CONTACTO", 
    SUM("cantidad") as total_gestiones,
    AVG("EvCal_Saludo"), 
    AVG("EvCal_Titular"), 
    AVG("EvCal_Familiar"), 
    AVG("EvCal_Presentacion"), 
    AVG("EvCal_Cordialidad"), 
    AVG("EvCal_Recado"), 
    AVG("EvCal_Empex"), 
    AVG("EvCal_Encargo"), 
    AVG("EvCal_Grabado"), 
    AVG("EvCal_Informacion"), 
    AVG("EvCal_Motivo"), 
    AVG("EvCal_Oferta"), 
    AVG("EvCal_Canales"), 
    AVG("EvCal_Copa"), 
    AVG("EvCal_Dudas"), 
    AVG("EvCal_Cierre"), 
    AVG("EvCal_Final")
FROM public.analisis_tokem
GROUP BY "YMD", "EMPRESA", "NOMBRE_EJECUTIVO", "CODIGO_CONTACTO";