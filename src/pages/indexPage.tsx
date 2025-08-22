import { Link } from "react-router-dom";
import DiscordLogin from "../components/DiscordLogin";


import "../Style/common/main.css";
import "../Style/common/indexButton.css";

export default function DeckPage() {
  return (
    <div className="overlay_box">
      <DiscordLogin />
      <a href="https://aka5144.github.io/TouhouCardGame">
        <p className="title_text text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          TOUHOU CARD GAME
        </p>
      </a>
      <Link
        to="/decks"
        className="buttonIndex w-2/3 sm:w-1/2 md:w-1/3 lg:w-1/4 aspect-[3/4] max-h-[400px]text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Display Decks
      </Link>
    </div>
  );
}
