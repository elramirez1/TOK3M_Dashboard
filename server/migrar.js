const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const sqliteDB = new sqlite3.Database('/Users/danielramirezquintana/Desktop/TOK3M_1/DB/TOKEM.db');
const pgPool = new Pool({
  user: 'danielramirezquintana',
  host: 'localhost',
  database: 'tokem_db',
  port: 5432,
});

async function migrar() {
    console.log("🚀 Iniciando migración masiva...");
    
    sqliteDB.all("SELECT YMD, EMPRESA, CODIGO_CONTACTO, NOMBRE_EJECUTIVO, cantidad, EvCal_Final FROM ANALISIS_TOK3M", async (err, rows) => {
        if (err) return console.error(err);
        
        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');
            for (const row of rows) {
                await client.query(
                    "INSERT INTO analisis_tokem (ymd, empresa, codigo_contacto, nombre_ejecutivo, cantidad, evcal_final) VALUES ($1, $2, $3, $4, $5, $6)",
                    [row.YMD, row.EMPRESA, row.CODIGO_CONTACTO, row.NOMBRE_EJECUTIVO, row.cantidad, row.EvCal_Final]
                );
            }
            await client.query('COMMIT');
            console.log("✅ Migración completada. El Trigger ha generado los cubos.");
        } catch (e) {
            await client.query('ROLLBACK');
            console.log("❌ Error:", e);
        } finally {
            client.release();
            process.exit();
        }
    });
}

migrar();
