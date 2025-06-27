require('dotenv').config({ path: '../BotPython/Data/.env' });
const jwt = require('jsonwebtoken');


const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');//better pacakge 
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'L\'origine CORS est interdite par la politique du serveur.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(cookieParser());




const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

function authenticateToken(req, res, next) {
  // On récupère le token dans les cookies
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
    req.user = user; // données décodées du token (id, username, ...)
    next();
  });
}

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

app.get('/user-info', authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    id: req.user.id,
    discriminator: req.user.discriminator
  });
});



app.get('/oauth-callback', async (req, res) => {
  console.log('Route /oauth-callback appelée'); // Log pour vérifier l'appel

  const code = req.query.code;
  if (!code) {
    console.log('Pas de code dans la requête');
    return res.status(400).send('No code provided');
  }

  try {
    // Échange du code contre un token d'accès Discord
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.CLIENTID,
        client_secret: process.env.CLIENTSECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URL,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Récupération des infos utilisateur Discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userResponse.data;

    // Génération du token JWT
    const jwtToken = jwt.sign(
      { id: userData.id, username: userData.username, discriminator: userData.discriminator },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('JWT token créé:', jwtToken);

    // Envoi du cookie au client
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: false, // à passer à true en prod avec HTTPS
      sameSite: 'Lax',
      maxAge: 3600000, // 1 heure
    });

    // Redirection vers la page frontend (sans exposer le token ni username en URL)
    res.redirect('http://localhost:5500/frontend/userDecks.html');
  } catch (error) {
    console.error('Erreur Discord:', error.response?.data || error.message);
    res.status(500).send('Erreur lors de l’authentification Discord');
  }
});


app.listen(port, () => {
  console.log(`Serveur Node.js lancé sur http://localhost:${port}`);
});