from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

@app.get("/api/stats")
def get_stats():
    try:
        conn = sqlite3.connect(DB_PATH)
        res = pd.read_sql("SELECT COUNT(*) as total FROM ANALISIS_TOK3M", conn)
        total = int(res['total'].iloc[0])
        conn.close()
        return {"total_llamadas": total}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/resumen/graficos")
def get_graficos():
    try:
        conn = sqlite3.connect(DB_PATH)
        # 1. Casos por día (YMD)
        df_dia = pd.read_sql("SELECT YMD as FECHA, COUNT(*) as cantidad FROM ANALISIS_TOK3M GROUP BY YMD ORDER BY YMD", conn)
        
        # 2. TODAS LAS EMPRESAS (Quitamos el LIMIT 5)
        df_emp = pd.read_sql("SELECT EMPRESA, COUNT(*) as cantidad FROM ANALISIS_TOK3M GROUP BY EMPRESA ORDER BY cantidad DESC", conn)
        
        # 3. Casos por contacto
        df_con = pd.read_sql("SELECT CODIGO_CONTACTO, COUNT(*) as cantidad FROM ANALISIS_TOK3M GROUP BY CODIGO_CONTACTO ORDER BY cantidad DESC LIMIT 10", conn)
        
        conn.close()
        return {
            "por_dia": df_dia.to_dict(orient='records'),
            "por_empresa": df_emp.to_dict(orient='records'),
            "por_contacto": df_con.to_dict(orient='records')
        }
    except Exception as e:
        return {"error": str(e)}
