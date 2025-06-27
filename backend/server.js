require('dotenv').config({ path: '../BotPython/Data/.env' });

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');//better pacakge 


const app = express();
const port = 3000;

app.use(cors()); 


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
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


app.get('/oauth-callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.CLIENTID,
      client_secret: process.env.CLIENTSECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URL,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = userResponse.data;

    const username = userData.discriminator !== '0'? `${userData.username}#${userData.discriminator}`: userData.username;
     res.redirect(`${process.env.USER_REDIRECT_URL}?username=${encodeURIComponent(username)}`);
} catch (error) {
  console.error('Erreur Discord:', error.response?.data || error.message);
  res.status(500).send('Erreur lors de l’authentification Discord');
}
});


app.listen(port, () => {
  console.log(`Serveur Node.js lancé sur http://localhost:${port}`);
});