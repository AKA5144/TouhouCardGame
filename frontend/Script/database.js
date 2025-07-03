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
          const deckId = encodeURIComponent(deck.ID);
          window.location.href = `deck.html?deckId=${deckId}`;
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
  let defaultImage = '';

  try {
    const res = await fetch('http://localhost:3000/default-card');
    const data = await res.json();
    defaultImage = data.image_url;
  } catch (error) {
    console.error('Erreur lors du chargement de l’image par défaut :', error);
    defaultImage = 'Assets/Decks/Default/default.webp'; // fallback
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  const selectedDeckId = getQueryParam('deckId');

  try {
    const [cardsRes, userRes] = await Promise.all([
      fetch('http://localhost:3000/cards'),
      fetch('http://localhost:3000/user-cards', { credentials: 'include' }),
    ]);
    const cards = await cardsRes.json();

    const owned = userRes.ok ? (await userRes.json()).ownedCards : [];

    // Conversion en string pour éviter mismatch types (string vs number)
    const filteredCards = selectedDeckId
      ? cards.filter(card => String(card.deck_id) === String(selectedDeckId))
      : cards;

    console.log('selectedDeckId:', selectedDeckId);
    console.log('filteredCards:', filteredCards);

    const switchInput = document.querySelector('.switch input');
    const showRealImages = switchInput?.checked ?? false;

    function updateDisplay(showReal) {
      container.innerHTML = '';
      filteredCards.forEach(card => {
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


