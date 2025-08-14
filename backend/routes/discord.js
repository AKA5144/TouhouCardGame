import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export const authRouter = express.Router();

export function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

authRouter.get('/discord/callback', async (req, res) => {
  const code = req.query.code;

  // Logs utiles
  console.log('--- DISCORD OAUTH CALLBACK ---');
  console.log('Code reçu:', code);
  console.log('DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID);
  console.log('DISCORD_REDIRECT_URI:', process.env.DISCORD_REDIRECT_URI);

  if (!code) return res.status(400).send('Missing code');

  // Vérification des variables d'environnement
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI) {
    console.error('❌ Missing Discord environment variables');
    return res.status(500).send('Server misconfigured');
  }

  try {
    // Préparer les paramètres pour Discord
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID.trim(),
      client_secret: process.env.DISCORD_CLIENT_SECRET.trim(),
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: process.env.DISCORD_REDIRECT_URI.trim(),
    });

    console.log('Payload envoyé à Discord:', Object.fromEntries(params));

    // Échanger le code contre un token
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log('Réponse token Discord:', tokenRes.data);

    if (!tokenRes.data.access_token) {
      console.error('❌ Aucun access_token reçu de Discord');
      return res.status(400).send('OAuth error: no access token');
    }

    const accessToken = tokenRes.data.access_token;

    // Récupérer les infos utilisateur
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;
    console.log('Utilisateur Discord:', user);

    // Créer un JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        global_name: user.global_name,
        avatar: user.avatar
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Stocker le JWT en cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const FRONTEND_URL = process.env.FRONTEND_URL?.trim() || 'http://localhost:5173';
    console.log('Redirection vers:', FRONTEND_URL);

    res.redirect(FRONTEND_URL);

  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.status(500).send(`OAuth failed: ${JSON.stringify(err.response?.data || err.message)}`);
  }
});

authRouter.get('/me', verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    global_name: req.user.global_name,
    avatar: req.user.avatar
  });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});
