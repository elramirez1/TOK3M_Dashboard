const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./users.db');

db.serialize(async () => {
    db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)");
    const adminPass = await bcrypt.hash('admin123', 10);
    db.run("INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)", ['admin', adminPass, 'ADMIN'], (err) => {
        if (err) console.log("El usuario ya existe o hubo un error.");
        else console.log("Usuario admin creado exitosamente con pass: admin123");
        process.exit();
    });
});
