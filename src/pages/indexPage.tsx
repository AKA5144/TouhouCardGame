import { Link } from "react-router-dom";
import DiscordLogin from "../components/DiscordLogin";


import "../Style/common/main.css";

export default function DeckPage() {
  return (
    <div className="overlay_box">
     <DiscordLogin />
      <a href="https://aka5144.github.io/TouhouCardGame" className="title_link">
        <p className="title_text text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          TOUHOU CARD GAME
          </p>
      </a>
      <Link
        to="/decks"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Display Decks
      </Link>
    </div>
    
  );
}



