from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
import os

app = FastAPI()

# Configuramos CORS para que React (puerto 5173) pueda hablar con Python (puerto 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# RUTA A TU BASE DE DATOS
DB_PATH = "/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db"

@app.get("/api/stats")
def get_stats():
    if not os.path.exists(DB_PATH):
        return {"error": "No se encontró la base de datos en la ruta especificada"}
    
    try:
        conn = sqlite3.connect(DB_PATH)
        # Consulta básica para probar la conexión
        df = pd.read_sql("SELECT COUNT(*) as total FROM ANALISIS_TOK3M", conn)
        total_llamadas = int(df['total'].iloc[0])
        conn.close()
        
        return {
            "total_llamadas": total_llamadas,
            "status": "Conectado a TOKEM.db"
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def read_root():
    return {"message": "API de TOK3M operativa"}
