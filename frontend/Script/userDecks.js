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
  if (username) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = `Bienvenue, ${username} !`;
  }
}

export async function getUserInfo() {
  try {
    const response = await fetch('http://localhost:3000/user-info', {
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

export function updateUserUI(userData, loginBtnId = 'discord-login-btn') {
  const welcomeEl = document.getElementById('welcome');
  const circle = document.querySelector('.discord-circle');
  const btn = document.getElementById(loginBtnId);
  const dropdown = document.getElementById('discord-dropdown');

  if (!userData) {
    // Invité
    if (welcomeEl) {
      welcomeEl.textContent = 'Welcome, Guest';
      welcomeEl.style.display = 'none';
    }
    if (circle) circle.style.display = 'none';
    if (dropdown) dropdown.style.display = 'none';
    if (btn) btn.style.display = 'inline-block';
    return;
  }

  // Connecté
  const welcomeText = userData.discriminator === '0' 
    ? `Welcome, ${userData.username} !` 
    : `Welcome, ${userData.username}#${userData.discriminator} !`;

  if (welcomeEl) {
    welcomeEl.textContent = welcomeText;
    welcomeEl.style.display = 'block';
  }
  if (btn) btn.style.display = 'none';

  if (circle) {
    circle.style.display = 'flex';

    const userId = userData.id;
    const avatarHash = userData.avatar;
    let avatarUrl;

    if (avatarHash) {
      const isGif = avatarHash.startsWith('a_');
      const format = isGif ? 'gif' : 'png';
      avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}?size=128`;
    } else {
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`;
    }

    circle.innerHTML = '';
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = 'Discord Avatar';
    img.classList.add('discord-avatar');
    circle.appendChild(img);
  }

  if (dropdown) {
    dropdown.innerHTML = `
      <p><strong>${userData.username}</strong></p>
      <P><a href="userDecks.html">My Collection</a></P>
      <button id="logout-btn">Log Out</button>
    `;
    dropdown.style.display = 'none';

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        fetch('http://localhost:3000/logout', {
          method: 'POST',
          credentials: 'include'
          })
        .then(() => window.location.reload())
        .catch(err => console.error('Erreur logout:', err));
      });
    }
  }
}

export async function fetchUserInfo(loginBtnId = 'discord-login-btn') {
  const userData = await getUserInfo();
  updateUserUI(userData, loginBtnId);
}



export function renderDiscordLogin(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <p id="welcome" style="display:none;">Bienvenue, invité</p>
    <a id="discord-login-btn" href="#" class="discord-btn">Log In</a>
    <div class="discord-circle" style="display:none; cursor: pointer;"></div>
    <div id="discord-dropdown" class="discord-dropdown" style="display:none;"></div>
    
  `;

  setWelcomeMessage('welcome');
  discordButton();

  fetchUserInfo('discord-login-btn');

  const circle = container.querySelector('.discord-circle');
  const dropdown = container.querySelector('#discord-dropdown');

  if (circle && dropdown) {
    circle.addEventListener('click', () => {
      if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
      } else {
        dropdown.style.display = 'none';
      }
    });

    // Optional : clic en dehors pour fermer dropdown
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }
}
