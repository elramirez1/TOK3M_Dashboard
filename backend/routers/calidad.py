from fastapi import APIRouter, Query
import sqlite3
import pandas as pd
from typing import List, Optional

router = APIRouter(prefix="/api/calidad")
DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

@router.get("/cumplimiento")
def get_cumplimiento(inicio: Optional[str]=None, fin: Optional[str]=None, codigos: Optional[List[str]]=Query(None), empresas: Optional[List[str]]=Query(None), ejecutivos: Optional[List[str]]=Query(None)):
    conn = sqlite3.connect(DB_PATH)
    f = []
    if inicio and fin:
        f.append(f"YMD BETWEEN '{inicio.replace('-', '')}' AND '{fin.replace('-', '')}'")
    if codigos:
        vals = ", ".join([f"'{c}'" for c in codigos])
        f.append(f"CODIGO_CONTACTO IN ({vals})")
    if empresas:
        vals = ", ".join([f"'{e}'" for e in empresas])
        f.append(f"EMPRESA IN ({vals})")
    if ejecutivos:
        vals = ", ".join([f"'{j}'" for j in ejecutivos])
        f.append(f"NOMBRE_EJECUTIVO IN ({vals})")
    
    where = "WHERE " + " AND ".join(f) if f else ""
    
    cols = {
        "Saludo":"EvCal_Saludo", "Titular":"EvCal_Titular", "Familiar":"EvCal_Familiar",
        "Presentación":"EvCal_Presentacion", "Cordialidad":"EvCal_Cordialidad",
        "Recado":"EvCal_Recado", "Empatía":"EvCal_Empex", "Encargo":"EvCal_Encargo",
        "Cierre":"EvCal_Cierre"
    }
    
    sel = ", ".join([f"AVG({v}) as {k}" for k, v in cols.items()])
    df = pd.read_sql(f"SELECT {sel} FROM ANALISIS_TOK3M {where}", conn)
    conn.close()
    
    return [{"item": k, "promedio": round(float(df.iloc[0][k] or 0), 1)} for k in cols.keys()]
