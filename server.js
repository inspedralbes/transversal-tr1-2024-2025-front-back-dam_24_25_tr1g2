const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process'); 
const app = express();
const port = 3000;
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'http://daw.inspedralbes.cat/phpmyadmin/',  // IP o dominio del servidor MySQL
    user: 'a21sarmarbau_alcohol',       // Usuario de la base de datos
    password: 'Alcohol1',  // Contraseña de la base de datos
    database: 'a21sarmarbau_alcohol' // Nombre de la base de datos
  });

  app.get('/', (req, res) => {
    db.query('SELECT * FROM productos', (err, result) => {
        if (err) {
            return res.status(500).send('Error en la consulta a la base de datos')
        }
        res.json(result);
    })
  })

  db.query('SELECT * FROM productos', (err, results, fields) => {
    if(err){
        console.error('Error', err);
        return;
    }
    console.log('Error', results);
  });
  db.end();

  app.get('/api/productos', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file');
        }
        res.json(JSON.parse(data));
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  
});

