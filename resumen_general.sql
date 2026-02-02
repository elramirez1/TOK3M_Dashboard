TRUNCATE TABLE public.resumen_general;

INSERT INTO public.resumen_general (
    ymd, empresa, nombre_ejecutivo, codigo_contacto, total_gestiones, cantidad
)
SELECT 
    "YMD", 
    "EMPRESA", 
    "NOMBRE_EJECUTIVO", 
    "CODIGO_CONTACTO", 
    SUM("cantidad") as total_gestiones,
    SUM("cantidad") as cantidad
FROM public.analisis_tokem
GROUP BY "YMD", "EMPRESA", "NOMBRE_EJECUTIVO", "CODIGO_CONTACTO";