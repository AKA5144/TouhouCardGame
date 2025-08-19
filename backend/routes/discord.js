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
  const state = req.query.state; 

  if (!code) return res.status(400).send('Missing code');

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI) {
    console.error('❌ Missing Discord environment variables');
    return res.status(500).send('Server misconfigured');
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID.trim(),
      client_secret: process.env.DISCORD_CLIENT_SECRET.trim(),
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: process.env.DISCORD_REDIRECT_URI.trim(),
    });

    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!tokenRes.data.access_token) {
      console.error('❌ Aucun access_token reçu de Discord');
      return res.status(400).send('OAuth error: no access token');
    }

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;

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

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });




    const redirectUrl = state ? decodeURIComponent(state) : 'https://aka5144.github.io/TouhouCardGame/';
    res.redirect(redirectUrl);

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
