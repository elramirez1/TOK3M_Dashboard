from fastapi import APIRouter, Query
import sqlite3
import pandas as pd
from typing import List, Optional

router = APIRouter(prefix="/api/resumen")
DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

@router.get("/graficos")
def get_graficos(inicio: Optional[str]=None, fin: Optional[str]=None, codigos: Optional[List[str]]=Query(None), empresas: Optional[List[str]]=Query(None), ejecutivos: Optional[List[str]]=Query(None)):
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
    
    df_dia = pd.read_sql(f"SELECT YMD as FECHA, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M {where} GROUP BY YMD ORDER BY YMD", conn)
    df_emp = pd.read_sql(f"SELECT EMPRESA, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M {where} GROUP BY EMPRESA ORDER BY cantidad DESC", conn)
    df_con = pd.read_sql(f"SELECT CODIGO_CONTACTO, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M {where} GROUP BY CODIGO_CONTACTO ORDER BY cantidad DESC", conn)
    df_eje = pd.read_sql(f"SELECT NOMBRE_EJECUTIVO, SUM(cantidad) as cantidad FROM ANALISIS_TOK3M {where} GROUP BY NOMBRE_EJECUTIVO ORDER BY cantidad DESC", conn)
    conn.close()
    
    return {
        "por_dia": df_dia.to_dict(orient='records'),
        "por_empresa": df_emp.to_dict(orient='records'),
        "por_contacto": df_con.to_dict(orient='records'),
        "por_ejecutivo": df_eje.to_dict(orient='records')
    }
