function loadPage(targetId, filePath) {
  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error("Fichier introuvable !");
      return response.text();
    })
    .then(data => {
      document.getElementById(targetId).innerHTML = data;
    })
    .catch(error => {
      console.error(`Erreur lors du chargement de ${filePath} :`, error);
    });
}