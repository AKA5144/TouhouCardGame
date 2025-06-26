require('dotenv').config({ path: '../BotPython/Data/.env' });

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); 

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASS,
  database: 'Touhou_decks'
});

db.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    console.log('Connecté à la base MySQL !');
  }
});

app.get('/deck-names', (req, res) => {
  db.query('SELECT name, image_url, image_hover_url, link FROM deck', (err, results) => {
    if (err) {
      console.error('Erreur en récupérant les noms des decks :', err);
      return res.status(500).send('Erreur serveur');
    }
    res.json(results); 
  });
});

app.get('/cards', (req, res) => {
  db.query('SELECT name, image_url FROM card', (err, results) => {
    if (err) {
      console.error('Erreur en récupérant les cartes :', err);
      return res.status(500).send('Erreur serveur');
    }
    res.json(results); 
  });
});

app.listen(port, () => {
  console.log(`Serveur Node.js lancé sur http://localhost:${port}`);
});