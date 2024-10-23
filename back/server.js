const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;
// const port = 23457;

// Middleware para permitir el parsing de JSON en los requests
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tr1_g2-alcohol',
    connectTimeout: 10000 
});

// const db = mysql.createConnection({
//     host: 'dam.inspedralbes.cat',
//     user: 'a23hashusraf_tr1-g2', 
//     password: 'InsPedralbes2024',
//     database: 'a23hashusraf_tr1-g2',
//     connectTimeout: 10000 
// });

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');

    // Crear tabla si no existe
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto VARCHAR(255) NOT NULL,
            imagen VARCHAR(255) NOT NULL,
            precio DECIMAL(10, 2) NOT NULL
        )`;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error al crear la tabla:', err);
            return;
        }
        console.log('Tabla "productos" creada o ya existe.');

        // Leer el archivo JSON
        fs.readFile('productos.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error al leer el archivo JSON:', err);
                return;
            }
            const productos = JSON.parse(data).productos;

            // Insertar los productos en la base de datos
            productos.forEach(producto => {
                const checkQuery = 'SELECT * FROM productos WHERE producto = ?';
                db.query(checkQuery, [producto.producto], (err, result) => {
                    if (err) {
                        console.error('Error en la consulta:', err);
                        return;
                    }
                    if (result.length > 0) {
                        console.log('El producto ya existe:', producto.producto);
                        return;
                    }
                    if(result.length == 0 ){
                        const insertQuery = 'INSERT INTO productos (producto, imagen, precio) VALUES (?, ?, ?)';
                        db.query(insertQuery, [producto.producto, producto.imagen, producto.precio], (err) => {
                            if (err) {
                                console.error('Error al insertar el producto:', err);
                            }
                        });
                        console.log('Productos insertados en la tabla "productos".');
                    }else{
                        console.log('El producto ya existe:', producto.producto);
                    }
                });         
            });
            
        });
    });
});

// Obtener todos los productos
app.get('/getProducto', (req, res) => {
    const query = 'SELECT * FROM productos'; 
    
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en la consulta a la base de datos');
        }
        res.json(result);
    });
});


app.listen(port, () => {
    // console.log(`Servidor escuchando en http://tr1g2.dam.inspedralbes.cat:${port}`);
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
