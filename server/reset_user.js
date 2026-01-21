const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./users.db');

db.serialize(async () => {
    db.run("DROP TABLE IF EXISTS usuarios");
    db.run("CREATE TABLE usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)");
    
    // Generamos el hash de admin123 manualmente para asegurar consistencia
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    
    db.run("INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)", ['admin', hash, 'ADMIN'], (err) => {
        if (err) console.error("Error:", err.message);
        else console.log("--- USUARIO ADMIN RESETEADO ---");
        console.log("User: admin");
        console.log("Pass: admin123");
        db.close();
    });
});
