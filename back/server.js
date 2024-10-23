const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
//const port = 23457;


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
});

app.get('/api/productos', (req, res) => {
    const query = 'SELECT * FROM productos'; 
    
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en la consulta a la base de datos');
        }
        res.json(result);
    });
});

app.post('/api/productos', (req, res) => {
    const { name, image_url, price } = req.body;
    
    if (!name || !image_url || !price) {
        return res.status(400).send('Todos los campos (name, image_url, price) son obligatorios.');
    }

    const query = 'INSERT INTO productos (name, image_url, price) VALUES (?, ?, ?)';
    
    db.query(query, [name, image_url, price], (err, result) => {
        if (err) {
            console.error('Error al insertar producto:', err);
            return res.status(500).send('Error al insertar producto en la base de datos.');
        }
        res.status(201).send('Producto creado exitosamente.');
    });
});

app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { name, image_url, price } = req.body;
    
    if (!name || !image_url || !price) {
        return res.status(400).send('Todos los campos (name, image_url, price) son obligatorios.');
    }

    const query = 'UPDATE productos SET name = ?, image_url = ?, price = ? WHERE id = ?';
    
    db.query(query, [name, image_url, price, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar producto:', err);
            return res.status(500).send('Error al actualizar el producto.');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado.');
        }

        res.send('Producto actualizado exitosamente.');
    });
});

app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM productos WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).send('Error al eliminar el producto.');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado.');
        }

        res.send('Producto eliminado exitosamente.');
    });
});

app.listen(port, () => {
    // console.log(`Servidor escuchando en http://tr1g2.dam.inspedralbes.cat:${port}`);
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

