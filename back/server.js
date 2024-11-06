const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const cors = require('cors');
const app = express();
const multer = require('multer');
const path = require('path');

const port = 3001;
// const port = 23459;

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
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');

    const createUsuariosTableQuery = `
    CREATE TABLE IF NOT EXISTS usuario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        apellido VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        direccion VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB;
`;

    db.query(createUsuariosTableQuery , (err) => {
        if (err) {
            console.error('Error al crear la tabla usuarios:', err);
            return;
        }
        console.log('Tabla "usuarios" creada o ya existe.');
    });



    // Crear tabla productos si no existe
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto VARCHAR(255) NOT NULL,
            imagen VARCHAR(255) NOT NULL,
            precio DECIMAL(10, 2) NOT NULL
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error al crear la tabla productos:', err);
            return;
        }
        console.log('Tabla "productos" creada o ya existe.');

        // Crear tabla pedidos si no existe
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
                    if (result.length == 0) {
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

    const createPedidosTableQuery = `
    CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        detalles TEXT,
        estado VARCHAR(255) DEFAULT 'Pendiente',
        total DECIMAL(10, 2),
        fecha_pedido DATE,
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
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

        res.status(201).json(result.insertId);
    });
});



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

        res.send('Producto actualizado con éxito');
    });
});

app.delete('/deleteProducto/:id', (req, res) => {
    const { id } = req.params;


    const selectQuery = 'SELECT imagen FROM productos WHERE id = ?';

    db.query(selectQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al consultar el producto en la base de datos:', err);
            return res.status(500).json({ error: 'Error al consultar el producto en la base de datos' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado en la base de datos' });
        }

        const imagen = result[0].imagen;

        const deleteQuery = 'DELETE FROM productos WHERE id = ?';

        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar el producto en la base de datos:', err);
                return res.status(500).json({ error: 'Error al eliminar el producto en la base de datos' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Producto no encontrado en la base de datos' });
            }

            const imagePath = path.join(__dirname, 'public/imagen', imagen);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error al eliminar el archivo de imagen:', err);
                    return res.status(500).json({ error: 'Error al eliminar el archivo de imagen' });
                }

                db.query('SELECT * FROM productos', (err, productos) => {
                    if (err) {
                        console.error('Error al consultar productos para actualizar el archivo JSON:', err);
                        return res.status(500).json({ error: 'Error al consultar productos' });
                    }

                    fs.writeFile('productos.json', JSON.stringify({ productos }, null, 2), 'utf8', (err) => {
                        if (err) {
                            console.error('Error al escribir en el archivo JSON:', err);
                            return res.status(500).json({ error: 'Error al escribir en el archivo JSON' });
                        }

                        res.json({ message: 'Producto eliminado con éxito y archivo JSON sincronizado' });
                    });
                });
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
    console.log("Datos recibidos en /registrarCompra:", req.body);
    const { usuario_id, detalles, estado, total, fecha_pedido } = req.body[0] || {};

    if (!usuario_id || !detalles || !estado || !total || !fecha_pedido) {
        console.error("Datos incompletos para registrar la compra:", req.body[0]);
        return res.status(400).send('Datos incompletos para registrar la compra');
    }

    const insertPurchaseQuery = `
        INSERT INTO pedidos (usuario_id, detalles, estado, total, fecha_pedido)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertPurchaseQuery, [usuario_id, detalles, estado, total, fecha_pedido], (err, result) => {
        if (err) {
            console.error('Error al registrar la compra en la base de datos:', err);
            return res.status(500).send('Error al registrar la compra en la base de datos');
        }

        res.send('Compra registrada con éxito');
    });
});

app.get('/getPedidos', (req, res) => {
    const query = 'SELECT * FROM pedidos';

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en la consulta a la base de datos');
        }
        res.json(result);
    });
})



app.delete('/eliminarCompra/:id', (req, res) => {
    const { id } = req.params;

    const deletePurchaseQuery = `
        DELETE FROM pedidos WHERE id = ?
    `;

    db.query(deletePurchaseQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la compra en la base de datos:', err);
            return res.status(500).json({ error: 'Error al eliminar la compra en la base de datos' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        res.json({ message: 'Compra eliminada con éxito' });
    });
});

app.put('/actualizarCompra/:id', (req, res) => {
    const { id } = req.params;
    const { estado, detalles } = req.body;

    const updatePurchaseQuery = `
        UPDATE pedidos
        SET estado = ?, detalles = ?
        WHERE id = ?
    `;

    db.query(updatePurchaseQuery, [estado, detalles, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la compra en la base de datos:', err);
            return res.status(500).json({ error: 'Error al actualizar la compra en la base de datos' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        res.json({ message: 'Compra actualizada con éxito' });
    });
});

app.post('/registrar', (req, res) => {
    console.log("Datos en /registrar:", req.body);
    const { id, nombre, apellido, email, password, direccion } = req.body[0] || {};
    if (!id || !nombre || !apellido || !email || !password || !direccion) {
        console.error("Datos incompletos para registrarse:", req.body[0]);
        return res.status(400).send('Datos incompletos para registrar');
    }
    const insertUser = `
    INSERT INTO usuario (id, nombre, apellido, email, password, direccion)
    VALUES (?, ?, ?, ?, ?, ?)
`;

db.query(insertUser, [id, nombre, apellido, email, password, direccion], (err, result) => {
    if (err) {
        console.error('Error al registrarse:', err);
        return res.status(500).send('Error al registrar en la base de datos');
    }

    res.send('Registro existoso');
});
});

app.post('/login', (req, res) => {
    // Accedemos al primer objeto del array en lugar de req.body directamente
    const { email, password } = req.body[0] || {};

    // Verificar que se envíen ambos campos
    if (!email || !password) {
        return res.status(400).send('Faltan datos: email o contraseña no proporcionados');
    }

    // Consulta para verificar si el usuario existe con el email y password proporcionados
    const query = 'SELECT * FROM usuario WHERE email = ? AND password = ?';

    db.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error al hacer login:', err);
            return res.status(500).send('Error en la base de datos');
        }

        if (result.length > 0) {
            // Usuario encontrado: login exitoso
            res.send('Login exitoso');
        } else {
            // Usuario no encontrado: pedir crear cuenta
            res.status(404).send('Usuario no encontrado. Por favor, crea una cuenta nueva.');
        }
    });
});


app.get('/getUsuarios', (req, res) => {
    const query = 'SELECT * FROM usuario';

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
