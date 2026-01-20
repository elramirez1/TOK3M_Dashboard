from fastapi import APIRouter, Query
import sqlite3
import pandas as pd
from typing import List, Optional

router = APIRouter(prefix="/api/calidad")
DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

COLS = {
    "SALUDO": "EvCal_Saludo", "TITULAR": "EvCal_Titular", "FAMILIAR": "EvCal_Familiar",
    "PRESENTACION": "EvCal_Presentacion", "CORDIALIDAD": "EvCal_Cordialidad",
    "RECADO": "EvCal_Recado", "EMPEX": "EvCal_Empex", "ENCARGO": "EvCal_Encargo",
    "GRABADO": "EvCal_Grabado", "INFORMACION": "EvCal_Informacion",
    "MOTIVO": "EvCal_Motivo", "OFERTA": "EvCal_Oferta", "CANALES": "EvCal_Canales",
    "COPA": "EvCal_Copa", "DUDAS": "EvCal_Dudas", "CIERRE": "EvCal_Cierre"
}

def get_where(inicio, fin, codigos, empresas, ejecutivos):
    f = []
    if inicio and fin:
        f.append(f"YMD BETWEEN '{inicio.replace('-', '')}' AND '{fin.replace('-', '')}'")
    if codigos:
        vals = ", ".join(["'" + str(c) + "'" for c in codigos])
        f.append(f"CODIGO_CONTACTO IN ({vals})")
    if empresas:
        vals = ", ".join(["'" + str(e) + "'" for e in empresas])
        f.append(f"EMPRESA IN ({vals})")
    if ejecutivos:
        vals = ", ".join(["'" + str(j) + "'" for j in ejecutivos])
        f.append(f"NOMBRE_EJECUTIVO IN ({vals})")
    return "WHERE " + " AND ".join(f) if f else ""

@router.get("/cumplimiento")
def get_cumplimiento(inicio: Optional[str]=None, fin: Optional[str]=None, codigos: Optional[List[str]]=Query(None), empresas: Optional[List[str]]=Query(None), ejecutivos: Optional[List[str]]=Query(None)):
    conn = sqlite3.connect(DB_PATH)
    where = get_where(inicio, fin, codigos, empresas, ejecutivos)
    sel = ", ".join([f"AVG({v}) as {k}" for k, v in COLS.items()])
    df = pd.read_sql(f"SELECT {sel} FROM ANALISIS_TOK3M {where}", conn)
    conn.close()
    return [{"item": k, "promedio": round(float(df.iloc[0][k] or 0), 1)} for k in COLS.keys()]

@router.get("/evolucion")
def get_evolucion(inicio: Optional[str]=None, fin: Optional[str]=None, codigos: Optional[List[str]]=Query(None), empresas: Optional[List[str]]=Query(None), ejecutivos: Optional[List[str]]=Query(None)):
    conn = sqlite3.connect(DB_PATH)
    where = get_where(inicio, fin, codigos, empresas, ejecutivos)
    sel = ", ".join([f"AVG({v}) as {k}" for k, v in COLS.items()])
    df = pd.read_sql(f"SELECT YMD as fecha, {sel} FROM ANALISIS_TOK3M {where} GROUP BY YMD ORDER BY YMD", conn)
    conn.close()
    return df.to_dict(orient='records')
