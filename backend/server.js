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

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin); // dynamique
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // preflight
  }
  next();
});

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

const path = require('path');

app.use(express.static(path.join(__dirname, 'frontend')));


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
    req.user = user; 
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
  db.query('SELECT id, name, image_url, deck_id  FROM card', (err, results) => {
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
    discriminator: req.user.discriminator,
    avatar: req.user.avatar  
  });
});

app.get('/user-cards', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT card_id 
    FROM user_cards 
    WHERE discord_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cartes du joueur :', err);
      return res.status(500).send('Erreur serveur');
    }

    const cardIds = results.map(row => row.card_id);
    res.json({ ownedCards: cardIds });
  });
});

app.post('/logout', (req, res) => {
  // Effacer le cookie JWT côté client
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // true en prod avec HTTPS
    sameSite: 'Lax',
  });
  res.status(200).send({ message: 'Déconnecté' });
});

app.get('/oauth-callback', async (req, res) => {
  console.log('Route /oauth-callback appelée'); // Log pour vérifier l'appel

  const { code, state } = req.query;
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

    const insertQuery = `
      INSERT INTO users (discord_id, username, discriminator, avatar, last_login)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      discriminator = VALUES(discriminator),
      avatar = VALUES(avatar),
      last_login = NOW()
    `;

    db.query(
  insertQuery,
  [userData.id, userData.username, userData.discriminator, userData.avatar],
  (err) => {
    if (err) {
      console.error('Erreur insertion utilisateur en BDD:', err);
    }
  }
);

    const jwtToken = jwt.sign(
      { 
        id: userData.id, 
        username: userData.username, 
        discriminator: userData.discriminator,
        avatar: userData.avatar //
      },
    process.env.JWT_SECRET,
);

    console.log('JWT token créé:', jwtToken);

    // Envoi du cookie au client
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: false, // à passer à true en prod avec HTTPS
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 semaine en millisecondes
    });

    // Redirection vers la page frontend (sans exposer le token ni username en URL)
      if(state) {
    const redirectUrl = decodeURIComponent(state);
    return res.redirect(redirectUrl);
  }

  // Sinon rediriger par défaut vers la home
  res.redirect('/');
  } catch (error) {
    console.error('Erreur Discord:', error.response?.data || error.message);
    res.status(500).send('Erreur lors de l’authentification Discord');
  }
});

app.listen(port, () => {
  console.log(`Serveur Node.js lancé sur http://localhost:${port}`);
});