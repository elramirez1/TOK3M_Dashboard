from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

@app.get("/api/resumen/graficos")
def get_graficos(
    inicio: Optional[str] = None, 
    fin: Optional[str] = None, 
    codigos: Optional[List[str]] = Query(None),
    empresas: Optional[List[str]] = Query(None)
):
    try:
        conn = sqlite3.connect(DB_PATH)
        filters = []
        
        if inicio and fin:
            filters.append(f"YMD BETWEEN '{inicio.replace('-', '')}' AND '{fin.replace('-', '')}'")
        
        if codigos:
            cods_str = ",".join([f"'{c}'" for c in codigos])
            filters.append(f"CODIGO_CONTACTO IN ({cods_str})")

        if empresas:
            emps_str = ",".join([f"'{e}'" for e in empresas])
            filters.append(f"EMPRESA IN ({emps_str})")
        
        where = "WHERE " + " AND ".join(filters) if filters else ""
        
        df_dia = pd.read_sql(f"SELECT YMD as FECHA, COUNT(*) as cantidad FROM ANALISIS_TOK3M {where} GROUP BY YMD ORDER BY YMD", conn)
        df_emp = pd.read_sql(f"SELECT EMPRESA, COUNT(*) as cantidad FROM ANALISIS_TOK3M {where} GROUP BY EMPRESA ORDER BY cantidad DESC", conn)
        df_con = pd.read_sql(f"SELECT CODIGO_CONTACTO, COUNT(*) as cantidad FROM ANALISIS_TOK3M {where} GROUP BY CODIGO_CONTACTO ORDER BY cantidad DESC", conn)
        
        conn.close()
        return {
            "por_dia": df_dia.to_dict(orient='records'),
            "por_empresa": df_emp.to_dict(orient='records'),
            "por_contacto": df_con.to_dict(orient='records')
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/stats")
def get_stats():
    conn = sqlite3.connect(DB_PATH)
    total = pd.read_sql("SELECT COUNT(*) as total FROM ANALISIS_TOK3M", conn).iloc[0]['total']
    conn.close()
    return {"total_llamadas": int(total)}
