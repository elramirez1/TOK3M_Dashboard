const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'danielramirezquintana',
  host: 'localhost',
  database: 'tokem_db',
  port: 5432,
});

async function fix() {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    
    try {
        await pool.query("DROP TABLE IF EXISTS usuarios");
        await pool.query(`
            CREATE TABLE usuarios (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT
            )
        `);
        await pool.query("INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3)", ['admin', hash, 'ADMIN']);
        console.log("✅ Usuario 'admin' con clave 'admin123' creado con éxito en Postgres.");
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        process.exit();
    }
}

fix();
