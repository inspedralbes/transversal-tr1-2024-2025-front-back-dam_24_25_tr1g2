const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 3001;

// Configuración del servidor HTTP y socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware para el parsing de JSON y CORS
app.use(express.json({ limit: '200mb' }));
app.use(cors());
app.use('/imagen', express.static(path.join(__dirname, 'public/imagen')));

// Configuración de multer para guardar imágenes
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

// Configuración de la conexión a la base de datos
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

    db.query(createUsuariosTableQuery, (err) => {
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

// Configuración de socket.io para gestionar nuevas conexiones
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Rutas de la API
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

// Registrar compra y emitir evento de nueva compra
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

        // Emitir evento a todos los clientes conectados
        io.emit('nuevaCompra', {
            id: result.insertId,
            usuario_id,
            detalles,
            estado,
            total,
            fecha_pedido
        });

        res.send('Compra registrada con éxito');
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

app.get('/getPedidos', (req, res) => {
    const query = 'SELECT * FROM pedidos';

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en la consulta a la base de datos');
        }
        res.json(result);
    });
});

app.patch('/updateEstadoPedido/:id', (req, res) => {
    const pedidoId = req.params.id;
    const { estado } = req.body;

    const estadosPermitidos = ['Recibido', 'En proceso', 'Enviado', 'En reparto'];

    if (!estadosPermitidos.includes(estado)) {
        return res.status(400).send('Estado no permitido');
    }

    const updateQuery = 'UPDATE pedidos SET estado = ? WHERE id = ?';
    db.query(updateQuery, [estado, pedidoId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado en la base de datos:', err);
            return res.status(500).send('Error al actualizar el estado en la base de datos');
        }

        // Emitir el evento de actualización del estado a los clientes
        io.emit('estadoActualizado', { id: pedidoId, estado });
        res.send('Estado actualizado con éxito');
    });
});



app.delete('/eliminarCompra/:id', (req, res) => {
    const id = req.params.id;
    const deleteQuery = 'DELETE FROM pedidos WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la comanda:', err);
            return res.status(500).send('Error al eliminar la comanda');
        }
        res.send({ message: 'Comanda eliminada con éxito' });
    });
});

app.post('/register', (req, res) => {
    console.log("Datos en /registrar:", req.body);
    // const { nombre, apellido, email, password, direccion } = req.body;
    
    const { email, password } = req.body;
    const nombre = 'nombre';
    const apellido = 'apellido';
    const direccion = 'direccion';
    if (!nombre || !apellido || !email || !password || !direccion) {
        console.error("Datos incompletos para registrarse:", req.body);
        return res.status(400).send('Datos incompletos para registrar');
    }
    const insertUser = `
    INSERT INTO usuario (nombre, apellido, email, password, direccion)
    VALUES (?, ?, ?, ?, ?)
`;

    db.query(insertUser, [nombre, apellido, email, password, direccion], (err, result) => {
        if (err) {
            console.error('Error al registrarse:', err);
            return res.status(500).send('Error al registrar en la base de datos');
        }

        res.send('Registro existoso');
    });
});

app.post('/login', (req, res) => {
    // Accedemos al primer objeto del array en lugar de req.body directamente
    console.log("Datos en /login:", req.body);
    const { email, password } = req.body;

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


// Iniciar el servidor HTTP y socket.io
server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
    // console.log(`Servidor escuchando en http://tr1g2.dam.inspedralbes.cat:${port}`);
});