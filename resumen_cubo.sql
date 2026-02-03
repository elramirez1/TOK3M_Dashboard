-- Table: public.resumen_cubo_fisico

-- DROP TABLE IF EXISTS public.resumen_cubo_fisico;

CREATE TABLE IF NOT EXISTS public.resumen_cubo_fisico
(
    fecha_id bigint,
    empresa text COLLATE pg_catalog."default",
    ejecutivo text COLLATE pg_catalog."default",
    contacto text COLLATE pg_catalog."default",
    total_gestiones integer,
    cal_saludo double precision,
    cal_titular double precision,
    cal_familiar double precision,
    cal_presentacion double precision,
    cal_cordialidad double precision,
    cal_recado double precision,
    cal_empex double precision,
    cal_encargo double precision,
    cal_grabado double precision,
    cal_informacion double precision,
    cal_motivo double precision,
    cal_oferta double precision,
    cal_canales double precision,
    cal_copa double precision,
    cal_dudas double precision,
    cal_cierre double precision,
    cal_nota_final double precision,
    risk_insulto double precision,
    risk_reclamo double precision,
    risk_incumplimiento double precision,
    risk_equivocado double precision,
    risk_ya_pago double precision,
    tiene_riesgo double precision,
    mot_cesante double precision,
    mot_sobreendeudado double precision,
    mot_enfermedad double precision,
    mot_desconoce double precision,
    mot_siniestro double precision,
    mot_fuera_pais double precision,
    mot_olvido double precision,
    mot_fallecido double precision,
    mot_catastrofe double precision,
    mot_no_quiere double precision,
    tiene_motivo double precision,
    emo_tristeza double precision,
    emo_miedo double precision,
    emo_enojo double precision,
    emo_alivio double precision,
    emo_preocupacion double precision,
    nivel_emocion double precision,
    ppm double precision
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.resumen_cubo_fisico
    OWNER to danielramirezquintana;
-- Index: idx_cubo_ejecutivo

-- DROP INDEX IF EXISTS public.idx_cubo_ejecutivo;

CREATE INDEX IF NOT EXISTS idx_cubo_ejecutivo
    ON public.resumen_cubo_fisico USING btree
    (ejecutivo COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_cubo_empresa

-- DROP INDEX IF EXISTS public.idx_cubo_empresa;

CREATE INDEX IF NOT EXISTS idx_cubo_empresa
    ON public.resumen_cubo_fisico USING btree
    (empresa COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_cubo_fecha

-- DROP INDEX IF EXISTS public.idx_cubo_fecha;

CREATE INDEX IF NOT EXISTS idx_cubo_fecha
    ON public.resumen_cubo_fisico USING btree
    (fecha_id ASC NULLS LAST)
    TABLESPACE pg_default;