TRUNCATE TABLE public.resumen_ppm;

INSERT INTO public.resumen_ppm (
    ymd, empresa, nombre_ejecutivo, codigo_contacto, total_gestiones, 
    "PPM_PROMEDIO", "PROMEDIO_SEGUNDOS"
)
SELECT 
    "YMD", 
    "EMPRESA", 
    "NOMBRE_EJECUTIVO", 
    "CODIGO_CONTACTO", 
    SUM("cantidad") as total_gestiones,
    -- Cálculo de PPM: (Palabras / Segundos) * 60. Usamos NULLIF para evitar error si Dur_Seg es 0.
    AVG(("N_Palabras"::float / NULLIF("Dur_Seg", 0)) * 60) as "PPM_PROMEDIO",
    -- Promedio simple de la columna Prom_Seg
    AVG("Prom_Seg") as "PROMEDIO_SEGUNDOS"
FROM public.analisis_tokem
GROUP BY "YMD", "EMPRESA", "NOMBRE_EJECUTIVO", "CODIGO_CONTACTO";