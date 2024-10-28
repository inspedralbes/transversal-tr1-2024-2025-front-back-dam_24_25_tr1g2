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

// Ruta para actualizar un producto existente
app.put('/updateProducto/:id', (req, res) => {
    const { id } = req.params; // Obtener el id del producto desde la URL
    const { producto, imagen, precio } = req.body; // Datos que vamos a actualizar

    // Primero actualizamos en la base de datos
    const updateQuery = `
        UPDATE productos
        SET producto = ?, imagen = ?, precio = ?
        WHERE id = ?
    `;

    db.query(updateQuery, [producto, imagen, precio, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto en la base de datos:', err);
            return res.status(500).send('Error al actualizar el producto en la base de datos');
        }

        // Comprobar si alguna fila fue actualizada
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado en la base de datos');
        }

        // Si la actualización en la base de datos fue exitosa, actualizamos el archivo JSON
        db.query('SELECT * FROM productos', (err, productos) => {
            if (err) {
                console.error('Error al consultar productos para actualizar el archivo JSON:', err);
                return res.status(500).send('Error al consultar productos');
            }

            // Guardamos los productos actualizados en el archivo JSON
            fs.writeFile('productos.json', JSON.stringify({ productos }, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).send('Error al escribir en el archivo JSON');
                }

                // Respondemos al cliente indicando que la actualización fue exitosa
                res.send('Producto actualizado con éxito y archivo JSON sincronizado');
            });
        });
    });
});

// Ruta para eliminar un producto
app.delete('/deleteProducto/:id', (req, res) => {
    const { id } = req.params; // Obtener el id del producto desde la URL

    // Eliminar el producto de la base de datos
    const deleteQuery = 'DELETE FROM productos WHERE id = ?';

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto en la base de datos:', err);
            return res.status(500).send('Error al eliminar el producto en la base de datos');
        }

        // Comprobar si alguna fila fue eliminada
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado en la base de datos');
        }

        // Si la eliminación en la base de datos fue exitosa, actualizamos el archivo JSON
        db.query('SELECT * FROM productos', (err, productos) => {
            if (err) {
                console.error('Error al consultar productos para actualizar el archivo JSON:', err);
                return res.status(500).send('Error al consultar productos');
            }

            // Guardamos los productos actualizados en el archivo JSON
            fs.writeFile('productos.json', JSON.stringify({ productos }, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).send('Error al escribir en el archivo JSON');
                }

                // Respondemos al cliente indicando que la eliminación fue exitosa
                res.send('Producto eliminado con éxito y archivo JSON sincronizado');
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

// Ruta para registrar una compra
app.post('/registrarCompra', (req, res) => {
    const { id, usuario_id, detalles, total, fecha_pedido } = req.body;

    // Validar que se recibieron todos los datos necesarios
    if (!id || !usuario_id || !detalles || !total || !fecha_pedido) {
        return res.status(400).send('Faltan datos necesarios para registrar la compra');
    }

    // Insertar la compra en la tabla "pedidos"
    const insertPurchaseQuery = `
          INSERT INTO pedidos (id, usuario_id, detalles, total, fecha_pedido)
          VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertPurchaseQuery, [id, usuario_id, detalles, total, fecha_pedido], (err, result) => {
        if (err) {
            console.error('Error al registrar la compra en la base de datos:', err);
            return res.status(500).send('Error al registrar la compra en la base de datos');
        }

        // Responder al cliente indicando que la compra se registró correctamente
        res.send('Compra registrada con éxito');
    });
});




app.listen(port, () => {
    // console.log(`Servidor escuchando en http://tr1g2.dam.inspedralbes.cat:${port}`);
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
