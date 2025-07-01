export function discordButton(){
  const clientId = '1386612121181093939';
  const redirectUri = 'http://localhost:3000/oauth-callback'; 
  const scope = 'identify';
  const responseType = 'code';

  // Encode l'URL actuelle dans state pour s'en souvenir
  const currentUrl = window.location.href;
  const state = encodeURIComponent(currentUrl);

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&state=${state}`;

  const btn = document.getElementById('discord-login-btn');
  if(btn) btn.href = discordAuthUrl;
}

export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    username: params.get('username'),
    token: params.get('token')
  };
}


export function setWelcomeMessage(elementId, usernameParam = 'username') {
  const params = getQueryParams();
  const username = params[usernameParam];
  console.log(username);
  if (username) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = `Bienvenue, ${username} !`;
  }
}

export async function fetchUserInfo(loginBtnId = 'discord-login-btn') {
  try {
    const response = await fetch('http://localhost:3000/user-info', {
      credentials: 'include'
    });

    const welcomeEl = document.getElementById('welcome');
    const circle = document.querySelector('.discord-circle');
    const btn = document.getElementById(loginBtnId);

    if (!response.ok) {
      if (welcomeEl) {
        welcomeEl.textContent = 'Welcome, Guest';
        welcomeEl.style.display = 'none'; // cacher texte invité
      }
      if (circle) circle.style.display = 'none'; // cacher cercle
      if (btn) btn.style.display = 'inline-block'; // bouton visible invité
      return;
    }

    const data = await response.json();

    const welcomeText = data.discriminator === '0' 
      ? `Welcome, ${data.username} !` 
      : `Welcome, ${data.username}#${data.discriminator} !`;

    if (welcomeEl) {
      welcomeEl.textContent = welcomeText;
      welcomeEl.style.display = 'block'; // afficher texte
    }
    if (btn) btn.style.display = 'none'; // cacher bouton login

    if (circle) {
      circle.style.display = 'flex'; // afficher cercle

      // Construire URL avatar
      const userId = data.id;
      const avatarHash = data.avatar;
      let avatarUrl;

      if (avatarHash) {
        const isGif = avatarHash.startsWith('a_');
        const format = isGif ? 'gif' : 'png';
        avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}?size=128`;
      } else {
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${parseInt(data.discriminator) % 5}.png`;
      }

      // Injecter <img> avatar dans le cercle
      circle.innerHTML = '';
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = 'Discord Avatar';
      img.classList.add('discord-avatar');
      circle.appendChild(img);
    }

  } catch (err) {
    console.error('Erreur récupération user info', err);
    const welcomeEl = document.getElementById('welcome');
    const circle = document.querySelector('.discord-circle');
    const btn = document.getElementById(loginBtnId);
    if (welcomeEl) welcomeEl.style.display = 'none';
    if (circle) circle.style.display = 'none';
    if (btn) btn.style.display = 'inline-block';
  }
}


export function renderDiscordLogin(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

container.innerHTML = `
  <p id="welcome" style="display:none;">Bienvenue, invité</p>
  <a id="discord-login-btn" href="#" class="discord-btn">Log In</a>
  <div class="discord-circle" style="display:none;"></div>
`;

  setWelcomeMessage('welcome');
  discordButton();

  fetchUserInfo('discord-login-btn');
}