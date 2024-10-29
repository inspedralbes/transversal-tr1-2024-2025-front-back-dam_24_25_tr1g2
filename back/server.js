const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const cors = require('cors');
const app = express();
const multer = require('multer');
const path = require('path');
const port = 3001;
// const port = 23457;

// Middleware para permitir el parsing de JSON en los requests
app.use(express.json({ limit: '200mb' }));

app.use(express.json());
app.use(cors());

app.use('/imagen', express.static(path.join(__dirname, 'public/imagen')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/imagen');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({ storage: storage });

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

    // Crear tabla productos si no existe
    const createProductosTableQuery = `
    // Crear tabla productos si no existe
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto VARCHAR(255) NOT NULL,
            imagen VARCHAR(255) NOT NULL,
            precio DECIMAL(10, 2) NOT NULL
        )
    `;

    db.query(createProductosTableQuery, (err) => {
        if (err) {
            console.error('Error al crear la tabla productos:', err);
            console.error('Error al crear la tabla productos:', err);
            return;
        }
        console.log('Tabla "productos" creada o ya existe.');

        // Leer el archivo JSON y agregar productos si es necesario
        fs.readFile('productos.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error al leer el archivo JSON:', err);
                return;
            }
            const productos = JSON.parse(data).productos;

            productos.forEach(producto => {
                const checkQuery = 'SELECT * FROM productos WHERE producto = ?';
                db.query(checkQuery, [producto.producto], (err, result) => {
                    if (err) {
                        console.error('Error en la consulta:', err);
                        return;
                    }
                    if (result.length === 0) {
                        const insertQuery = 'INSERT INTO productos (producto, imagen, precio) VALUES (?, ?, ?)';
                        db.query(insertQuery, [producto.producto, producto.imagen, producto.precio], (err) => {
                            if (err) {
                                console.error('Error al insertar el producto:', err);
                            }
                        });
                        console.log('Productos insertados en la tabla "productos".');
                    } else {
                        console.log('El producto ya existe:', producto.producto);
                    }
                });
            });
        });
    });

    // Crear tabla pedidos si no existe
    const createPedidosTableQuery = `
        CREATE TABLE IF NOT EXISTS pedidos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            detalles TEXT NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    db.query(createPedidosTableQuery, (err) => {
        if (err) {
            console.error('Error al crear la tabla pedidos:', err);
            return;
        }
        console.log('Tabla "pedidos" creada o ya existe.');
    });
});

const createPedidosTableQuery = `
            CREATE TABLE IF NOT EXISTS pedidos (
                id INT PRIMARY KEY,
                usuario_id INT,
                detalles TEXT,
                estado VARCHAR(255) DEFAULT 'Pendiente',
                total DECIMAL(10, 2),
                fecha_pedido DATE
            )
        `;

        db.query(createPedidosTableQuery, (err) => {
            if (err) {
                console.error('Error al crear la tabla pedidos:', err);
                return;
            }
            console.log('Tabla "pedidos" creada o ya existe.');

            // Crear tabla intermedia pedido_productos
            const createPedidoProductosTableQuery = `
                CREATE TABLE IF NOT EXISTS pedido_productos (
                    pedido_id INT,
                    producto_id INT,
                    cantidad INT NOT NULL DEFAULT 1,
                    PRIMARY KEY (pedido_id, producto_id),
                    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
                    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
                )
            `;

            db.query(createPedidoProductosTableQuery, (err) => {
                if (err) {
                    console.error('Error al crear la tabla pedido_productos:', err);
                    return;
                }
                console.log('Tabla "pedido_productos" creada o ya existe.');
            });
        });

const createPedidosTableQuery = `
            CREATE TABLE IF NOT EXISTS pedidos (
                id INT PRIMARY KEY,
                usuario_id INT,
                detalles TEXT,
                estado VARCHAR(255) DEFAULT 'Pendiente',
                total DECIMAL(10, 2),
                fecha_pedido DATE
            )
        `;

        db.query(createPedidosTableQuery, (err) => {
            if (err) {
                console.error('Error al crear la tabla pedidos:', err);
                return;
            }
            console.log('Tabla "pedidos" creada o ya existe.');

            // Crear tabla intermedia pedido_productos
            const createPedidoProductosTableQuery = `
                CREATE TABLE IF NOT EXISTS pedido_productos (
                    pedido_id INT,
                    producto_id INT,
                    cantidad INT NOT NULL DEFAULT 1,
                    PRIMARY KEY (pedido_id, producto_id),
                    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
                    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
                )
            `;

            db.query(createPedidoProductosTableQuery, (err) => {
                if (err) {
                    console.error('Error al crear la tabla pedido_productos:', err);
                    return;
                }
                console.log('Tabla "pedido_productos" creada o ya existe.');
            });
        });

app.post('/addProducto', upload.single('imagen'), (req, res) => {
    const { producto, precio } = req.body;
    const imagen = req.file ? req.file.filename : null;

    if (!producto || !imagen || !precio) {
        return res.status(400).send('Faltan datos para agregar el producto');
    }

    const insertQuery = 'INSERT INTO productos (producto, imagen, precio) VALUES (?, ?, ?)';

    db.query(insertQuery, [producto, imagen, precio], (err, result) => {
        if (err) {
            console.error('Error al insertar el producto en la base de datos:', err);
            return res.status(500).send('Error al insertar el producto en la base de datos');
        }

        db.query('SELECT * FROM productos', (err, productos) => {
            if (err) {
                console.error('Error al consultar productos para actualizar el archivo JSON:', err);
                return res.status(500).send('Error al consultar productos');
            }

            fs.writeFile('productos.json', JSON.stringify({ productos }, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).send('Error al escribir en el archivo JSON');
                }
                res.status(201).json(result.insertId);
            });
        });
    });
});

// Ruta para actualizar un producto existente

app.put('/updateProducto/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params; // Obtener el id del producto desde la URL
    const { producto, precio } = req.body; // Datos que vamos a actualizar
    const imagen = req.file ? req.file.filename : req.body.imagen;

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

        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado en la base de datos');
        }

        db.query('SELECT * FROM productos', (err, productos) => {
            if (err) {
                console.error('Error al consultar productos para actualizar el archivo JSON:', err);
                return res.status(500).send('Error al consultar productos');
            }

            fs.writeFile('productos.json', JSON.stringify({ productos }, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).send('Error al escribir en el archivo JSON');
                }

                res.send('Producto actualizado con éxito y archivo JSON sincronizado');
            });
        });
    });
});

app.delete('/deleteProducto/:id', (req, res) => {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM productos WHERE id = ?';

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto en la base de datos:', err);
            return res.status(500).send('Error al eliminar el producto en la base de datos');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado en la base de datos');
        }

        db.query('SELECT * FROM productos', (err, productos) => {
            if (err) {
                console.error('Error al consultar productos para actualizar el archivo JSON:', err);
                return res.status(500).send('Error al consultar productos');
            }

            fs.writeFile('productos.json', JSON.stringify({ productos }, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).send('Error al escribir en el archivo JSON');
                }

                res.send('Producto eliminado con éxito y archivo JSON sincronizado');
            });
        });
    });
});

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

app.post('/registrarCompra', (req, res) => {
    const { id, usuario_id, estado, detalles, total, fecha_pedido } = req.body;
    const { usuario_id, detalles, total, fecha } = req.body[0];  // Extrayendo el primer pedido del array recibido

    if (!id || !usuario_id ||!estado ||!detalles || !total || !fecha_pedido) {
        return res.status(400).send('Faltan datos necesarios para registrar la compra');
    }

    const insertPurchaseQuery = `
          INSERT INTO pedidos (id, usuario_id, estado, detalles, total, fecha_pedido)
          VALUES (?, ?, ?, ?, ?)
          INSERT INTO pedidos (usuario_id, detalles, total, fecha_pedido)
          VALUES (?, ?, ?, ?)
    `;

    db.query(insertPurchaseQuery, [id, usuario_id, estado,detalles, total, fecha_pedido], (err, result) => {
    db.query(insertPurchaseQuery, [usuario_id, detalles, total, fecha], (err, result) => {
        if (err) {
            console.error('Error al registrar la compra en la base de datos:', err);
            return res.status(500).send('Error al registrar la compra en la base de datos');
        }

        res.send('Compra registrada con éxito');
    });
});

// Ruta para obtener todas las compras registradas
app.get('/registrarCompra', (req, res) => {
    const query = `
        SELECT pedidos.*, 
               GROUP_CONCAT(producto.producto, ' (Cantidad: ', pedido_productos.cantidad, ')') AS productos_comprados
        FROM pedidos
        LEFT JOIN pedido_productos ON pedidos.id = pedido_productos.pedido_id
        LEFT JOIN productos AS producto ON pedido_productos.producto_id = producto.id
        GROUP BY pedidos.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las compras:', err);
            return res.status(500).send('Error al obtener las compras');
        }
        res.json(results);
    });
});


//Conectar al server

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});