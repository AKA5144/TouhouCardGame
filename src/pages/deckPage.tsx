import DiscordLogin from "../components/DiscordLogin";
import Decks from "../components/deck";

import "../Style/common/main.css";

export default function DeckPage() {
  return (
    <div className="overlay_box">
     <DiscordLogin />    
      <a href="http://localhost:5173" className="title_link">
        <p className="title_text text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          TOUHOU CARD GAME
          </p>
      </a>
      <Decks />
    </div>
  );
}
