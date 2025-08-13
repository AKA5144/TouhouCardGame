import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from "./pages/indexPage";
import DeckPage from "./pages/deckPage";
import DeckDetailPage from "./pages/deckDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/decks" element={<DeckPage />} />
        <Route path="/deck/:deckName" element={<DeckDetailPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
