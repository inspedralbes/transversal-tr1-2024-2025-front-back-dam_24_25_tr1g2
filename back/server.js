const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const { spawn } = require('child_process'); 
const app = express();
const port = 3000;


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'tr1',
    connectTimeout: 10000
  });

  app.get('/api/productos', (req, res) => {
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
    console.log('Si', results);
  });
  db.end();



app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  
});

