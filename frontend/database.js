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


export function loadCards(containerId = 'card-collection') {
  fetch('http://localhost:3000/cards')//requete vers le domaine créer par get app en backend
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
        div.classList.add('card_box');
        div.textContent = deck.name;

        div.style.backgroundImage = `url('${deck.image_url}')`;

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