import dotenv from 'dotenv';
dotenv.config({ path: '../../BotPython/Data/.env' })

export function DiscordButtonConnect() {
  const clientId = '1386612121181093939';
  const redirectUri = 'http://localhost:3000/oauth-callback'; 
  const scope = 'identify';
  const responseType = 'code';

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;

  const btn = document.getElementById('discord-login-btn');
  btn.href = discordAuthUrl;
}
