from fastapi import APIRouter, Query
import sqlite3
import pandas as pd
from typing import List, Optional

router = APIRouter(prefix="/api/calidad")
DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

COLS_VARS = {
    "SALUDO": "EvCal_Saludo", "TITULAR": "EvCal_Titular", "FAMILIAR": "EvCal_Familiar",
    "PRESENTACION": "EvCal_Presentacion", "CORDIALIDAD": "EvCal_Cordialidad",
    "RECADO": "EvCal_Recado", "EMPEX": "EvCal_Empex", "ENCARGO": "EvCal_Encargo",
    "GRABADO": "EvCal_Grabado", "INFORMACION": "EvCal_Informacion",
    "MOTIVO": "EvCal_Motivo", "OFERTA": "EvCal_Oferta", "CANALES": "EvCal_Canales",
    "COPA": "EvCal_Copa", "DUDAS": "EvCal_Dudas", "CIERRE": "EvCal_Cierre"
}

@router.get("/cumplimiento")
def get_cumplimiento(inicio: Optional[str]=None, fin: Optional[str]=None, codigos: Optional[List[str]]=Query(None), empresas: Optional[List[str]]=Query(None), ejecutivos: Optional[List[str]]=Query(None)):
    conn = sqlite3.connect(DB_PATH)
    f = []
    if inicio and fin: f.append(f"YMD BETWEEN '{inicio.replace('-', '')}' AND '{fin.replace('-', '')}'")
    if codigos: f.append(f"CODIGO_CONTACTO IN (" + ", ".join([f"'{c}'" for c in codigos]) + ")")
    if empresas: f.append(f"EMPRESA IN (" + ", ".join([f"'{e}'" for e in empresas]) + ")")
    if ejecutivos: f.append(f"NOMBRE_EJECUTIVO IN (" + ", ".join([f"'{j}'" for j in ejecutivos]) + ")")
    where = "WHERE " + " AND ".join(f) if f else ""
    
    sel = ", ".join([f"AVG({v}) as {k}" for k, v in COLS_VARS.items()])
    df = pd.read_sql(f"SELECT {sel}, AVG(EvCal_Final) as FINAL FROM ANALISIS_TOK3M {where}", conn)
    conn.close()
    
    # Retornamos la lista de 16 + la variable FINAL al final
    res = [{"item": k, "promedio": round(float(df.iloc[0][k] or 0), 1)} for k in COLS_VARS.keys()]
    res.append({"item": "FINAL", "promedio": round(float(df.iloc[0]['FINAL'] or 0), 1)})
    return res

@router.get("/evolucion")
def get_evolucion(inicio: Optional[str]=None, fin: Optional[str]=None, codigos: Optional[List[str]]=Query(None), empresas: Optional[List[str]]=Query(None), ejecutivos: Optional[List[str]]=Query(None)):
    conn = sqlite3.connect(DB_PATH)
    f = []
    if inicio and fin: f.append(f"YMD BETWEEN '{inicio.replace('-', '')}' AND '{fin.replace('-', '')}'")
    if codigos: f.append(f"CODIGO_CONTACTO IN (" + ", ".join([f"'{c}'" for c in codigos]) + ")")
    if empresas: f.append(f"EMPRESA IN (" + ", ".join([f"'{e}'" for e in empresas]) + ")")
    if ejecutivos: f.append(f"NOMBRE_EJECUTIVO IN (" + ", ".join([f"'{j}'" for j in ejecutivos]) + ")")
    where = "WHERE " + " AND ".join(f) if f else ""
    
    sel = ", ".join([f"AVG({v}) as {k}" for k, v in COLS_VARS.items()])
    df = pd.read_sql(f"SELECT YMD as fecha, {sel}, AVG(EvCal_Final) as FINAL FROM ANALISIS_TOK3M {where} GROUP BY YMD ORDER BY YMD", conn)
    conn.close()
    return df.to_dict(orient='records')
