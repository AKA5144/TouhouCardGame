export function loadDecks(containerId = 'deck-collection') {
  fetch('https://touhou-backend.onrender.com/deck-names')//requete vers le domaine créer par get app en backend
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
          const deckName = encodeURIComponent(deck.name);
          window.location.href = `deck.html?deckId=${deckId}&deckName=${deckName}`;
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
    const res = await fetch('https://touhou-backend.onrender.com/default-card');
    const data = await res.json();
    defaultImage = data.image_url;
  } catch (error) {
    console.error('Erreur chargement image par défaut :', error);
    defaultImage = 'Assets/Decks/Default/default.webp';
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const selectedDeckId = getQueryParam('deckId');

  try {
    const [cardsRes, userRes] = await Promise.all([
      fetch('https://touhou-backend.onrender.com/cards'),
      fetch('https://touhou-backend.onrender.com/user-cards', { credentials: 'include' }),
    ]);
    const cards = await cardsRes.json();
    const owned = userRes.ok ? (await userRes.json()).ownedCards : [];

    const getOwnedCard = (cardId) => owned.find(c => c.card_id === cardId) || null;

    const filteredCards = selectedDeckId
      ? cards.filter(card => String(card.deck_id) === String(selectedDeckId))
      : cards;

    const switchInput = document.querySelector('.switch input');
    const showRealImages = switchInput?.checked ?? false;

    const rarityMap = {
      1: 'Assets/Border/bronze.png',
      2: 'Assets/Border/silver.png',
      3: 'Assets/Border/gold.png',
      4: 'Assets/Border/rainbow.png',
    };

    const rarityLabels = {
      0: 'Common',
      1: 'Bronze',
      2: 'Silver',
      3: 'Gold',
      4: 'Rainbow',
    };

    function updateDisplay(showReal) {
      container.innerHTML = '';

      filteredCards.forEach(card => {
        const div = document.createElement('div');
        div.classList.add('deck_box');
        div.textContent = card.name;

        const ownedCard = getOwnedCard(card.id);
        const isOwned = !!ownedCard;
        let initialRarity = 0;
        let quantityTotal = 0;

        if (isOwned) {
          const quantities = ownedCard.quantity_by_rarity || {};

          // Trouver la rareté max possédée pour l'affichage initial
          for (let r = 4; r >= 0; r--) {
            if (quantities[r] > 0) {
              initialRarity = r;
              break;
            }
          }

          quantityTotal = Object.values(quantities).reduce((a, b) => a + b, 0);

          if (quantityTotal > 0) {
            const quantityDiv = document.createElement('div');
            quantityDiv.classList.add('quantity_box');

            let quantitiesText = `<strong>Total: ${quantityTotal}</strong><br>`;
            for (const [key, label] of Object.entries(rarityLabels)) {
              const q = quantities[key] || 0;
              if (q > 0) {
                quantitiesText += `${label}: ${q}<br>`;
              }
            }

            quantityDiv.innerHTML = quantitiesText;
            div.appendChild(quantityDiv);
          }
        }

        const imageUrl = showReal || isOwned ? card.image_url : defaultImage;
        div.style.backgroundImage = `url('${imageUrl}')`;

        // Ajout de la bordure initiale
        let currentRarity = initialRarity;
        if (isOwned && currentRarity > 0) {
          const border = document.createElement('div');
          border.classList.add('card_border');
          border.style.backgroundImage = `url('${rarityMap[currentRarity]}')`;
          border.style.backgroundSize = 'cover';
          border.style.backgroundPosition = 'center';
          div.appendChild(border);
        }

        if (showReal || isOwned) {
          const nameDiv = document.createElement('div');
          nameDiv.classList.add('card_name');
          nameDiv.textContent = card.name;
          div.appendChild(nameDiv);
          resizeTextToFit(nameDiv);
        }

        // Gestion du clic pour changer la bordure cycliquement
        if (isOwned) {
          const quantities = ownedCard.quantity_by_rarity || {};
          const ownedRarities = Object.keys(quantities)
            .map(r => parseInt(r))
            .filter(r => quantities[r] > 0)
            .sort((a, b) => b - a); // tri décroissant rareté

          if (ownedRarities.length > 1) {
            div.style.cursor = 'pointer'; // Indique que c’est cliquable

            div.addEventListener('click', () => {
              // Trouver l’index actuel dans ownedRarities
              const currentIndex = ownedRarities.indexOf(currentRarity);
              // Passer à la rareté suivante en boucle
              const nextIndex = (currentIndex + 1) % ownedRarities.length;
              currentRarity = ownedRarities[nextIndex];

              // Enlever bordure précédente
              const oldBorder = div.querySelector('.card_border');
              if (oldBorder) oldBorder.remove();

              // Ajouter bordure si rareté > 0 (Common n’a pas d’image)
              if (currentRarity > 0 && rarityMap[currentRarity]) {
                const newBorder = document.createElement('div');
                newBorder.classList.add('card_border');
                newBorder.style.backgroundImage = `url('${rarityMap[currentRarity]}')`;
                newBorder.style.backgroundSize = 'cover';
                newBorder.style.backgroundPosition = 'center';
                div.appendChild(newBorder);
              }
            });
          }
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
    console.error('Erreur chargement cartes ou possessions :', err);
  }
}


function resizeTextToFit(element, maxFontSize = 28, minFontSize = 12) {
  let fontSize = maxFontSize;
  element.style.fontSize = fontSize + 'px';

  const parentWidth = element.parentElement.getBoundingClientRect().width * 0.9;

  while (fontSize > minFontSize && element.scrollWidth > parentWidth) {
    fontSize--;
    element.style.fontSize = fontSize + 'px';
  }
}