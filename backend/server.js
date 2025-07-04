require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim());
console.log('🔵 Origines autorisées :', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 Requête CORS venant de :', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
   console.log('⛔ CORS REFUSÉ :', origin);
    return callback(new Error('CORS origin interdit'));
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());


const staticPath = process.env.STATIC_DIR || path.join(__dirname, 'frontend');
app.use(express.static(staticPath));

// 🗄️ Connexion base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Utiliser le port 44067 de votre capture
  connectTimeout: 30000, // 30 secondes
  ssl: { rejectUnauthorized: false } // SSL requis par Railway
});

db.connect((err) => {
  if (err) {
    console.error('Erreur DB:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
      }
    });
  } else {
    console.log('✅ Connecté à la base de données');
  }
});

db.on('error', (err) => {
  console.error('Erreur de connexion persistante:', err);
});

// 🔐 Middleware Auth
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
}

// 📦 Routes
app.get('/deck-names', (req, res) => {
  db.query('SELECT ID, name, image_url, image_hover_url, link FROM deck', (err, results) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(results);
  });
});

app.get('/cards', (req, res) => {
  db.query('SELECT id, name, image_url, deck_id FROM card', (err, results) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(results);
  });
});

app.get('/default-card', (req, res) => {
  db.query('SELECT image_url FROM card WHERE id = 0', (err, results) => {
    if (err) return res.status(500).send('Erreur serveur');
    if (results.length === 0) return res.status(404).send('Carte non trouvée');
    res.json({ image_url: results[0].image_url });
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
  db.query('SELECT card_id FROM user_cards WHERE discord_id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).send('Erreur serveur');
    const cardIds = results.map(row => row.card_id);
    res.json({ ownedCards: cardIds });
  });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    path: '/',
    // domain: 'example.com', // idem si défini à la création
  });
  res.status(200).send({ message: 'Déconnecté' });
});

app.get('/oauth-callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.CLIENTID,
        client_secret: process.env.CLIENTSECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URL,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userResponse.data;

    db.query(
      `INSERT INTO users (discord_id, username, discriminator, avatar, last_login)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
       username = VALUES(username),
       discriminator = VALUES(discriminator),
       avatar = VALUES(avatar),
       last_login = NOW()`,
      [user.id, user.username, user.discriminator, user.avatar],
      err => {
        if (err) console.error('Erreur insertion utilisateur en BDD:', err);
      }
    );

    const jwtToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 semaine
    });

    if (state) return res.redirect(decodeURIComponent(state));
    res.redirect('/');
  } catch (error) {
    console.error('Erreur Discord:', error.response?.data || error.message);
    res.status(500).send('Erreur authentification Discord');
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);

  const SERVER_URL = process.env.SERVER_URL || 'https://ton-domaine-render.onrender.com';

  function sendPing() {
    axios.get(SERVER_URL)
      .then(res => {
        console.log(`Ping envoyé, status: ${res.status}`);
      })
      .catch(err => {
        console.error('Ping échoué:', err.message);
      });
  }

  sendPing();

  setInterval(sendPing, 10 * 60 * 1000);
});
