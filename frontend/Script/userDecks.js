export function discordButton(){
    const clientId = '1386612121181093939';
    const redirectUri = 'http://localhost:3000/oauth-callback'; 
    const scope = 'identify';
    const responseType = 'code';

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;

    document.getElementById('discord-login-btn').href = discordAuthUrl;
}

export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    username: params.get('username'),
    token: params.get('token')
  };
}

export function getQueryParam(paramName) {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramName);
}

export function setWelcomeMessage(elementId, usernameParam = 'username') {
  const username = getQueryParam(usernameParam);
  if (username) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = `Bienvenue, ${username} !`;
  }
}

export async function fetchUserInfo() {
  console.log("fetchUserInfo() appelé"); // Log au début

  try {
    const response = await fetch('http://localhost:3000/user-info', {
      credentials: 'include'
    });

    console.log("Réponse reçue:", response.status);

    if (!response.ok) {
      console.log("Réponse pas OK, utilisateur invité");
      document.getElementById('welcome').textContent = 'Bienvenue, invité';
      return;
    }

    const data = await response.json();
    console.log("Données utilisateur reçues:", data);

    const welcomeText = data.discriminator === '0' 
  ? `Bienvenue, ${data.username} !` 
  : `Bienvenue, ${data.username}#${data.discriminator} !`;

document.getElementById('welcome').textContent = welcomeText;

  } catch (err) {
    console.error('Erreur récupération user info', err);
    document.getElementById('welcome').textContent = 'Bienvenue, invité';
  }
}
