from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resumen, calidad
import sqlite3
import pandas as pd

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(resumen.router)
app.include_router(calidad.router)

DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

@app.get("/api/stats")
def get_stats():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT SUM(cantidad) as total, AVG(EvCal_Final) as promedio FROM ANALISIS_TOK3M", conn)
    total = int(df.iloc[0]['total'] or 0)
    promedio = float(df.iloc[0]['promedio'] or 0)
    conn.close()
    return {"total_llamadas": total, "promedio_calidad": f"{round(promedio, 1)}%"}
