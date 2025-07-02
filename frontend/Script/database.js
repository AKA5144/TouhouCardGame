export function loadDecks(containerId = 'deck-collection') {
  fetch('http://localhost:3000/deck-names')//requete vers le domaine créer par get app en backend
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Aucun élément avec l'id "${containerId}" trouvé.`);
        return;
      }

      container.innerHTML = '';//clear the container

      data.forEach(deck => {
        const div = document.createElement('div');
        div.classList.add('deck_box');
        div.textContent = deck.name;

        div.style.backgroundImage = `url('${deck.image_url}')`;

        div.addEventListener('mouseenter', () => {
        div.style.backgroundImage = `url('${deck.image_hover_url}')`;
        });

        div.addEventListener('mouseleave', () => {
          div.style.backgroundImage = `url('${deck.image_url}')`;
        });

        div.addEventListener('click', () => {
          if (deck.link) {
            window.location.href = deck.link;
          }
        });

        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error('Erreur lors du chargement des decks :', err);
    });
}


export async function loadCards(containerId = 'card-collection') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const defaultImage = '../Assets/Decks/Default/default.webp';

  try {
    const [cardsRes, userRes] = await Promise.all([
      fetch('http://localhost:3000/cards'),
      fetch('http://localhost:3000/user-cards', { credentials: 'include' }),
    ]);
    const cards = await cardsRes.json();

    const owned = userRes.ok ? (await userRes.json()).ownedCards : [];

    const switchInput = document.querySelector('.switch input');
    const showRealImages = switchInput?.checked ?? false;

function updateDisplay(showReal) {
  container.innerHTML = '';
  cards.forEach(card => {
    const div = document.createElement('div');
    div.classList.add('card_box');

    const isOwned = owned.includes(card.id);
    const imageUrl = showReal || isOwned ? card.image_url : defaultImage;
    div.style.backgroundImage = `url('${imageUrl}')`;

    if (showReal || isOwned) {
      div.textContent = card.name;
    } else {
      div.textContent = '';
    }

    container.appendChild(div);
  });
}

    updateDisplay(showRealImages);

    if (switchInput) {
      switchInput.addEventListener('change', () => {
        updateDisplay(switchInput.checked);
      });
    }
  } catch (err) {
    console.error('Erreur lors du chargement des cartes ou de la possession :', err);
  }
}
