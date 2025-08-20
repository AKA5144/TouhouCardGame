import { useEffect, useRef, useState } from "react";
import "../Style/common/discord.css";

const CLIENT_ID = "1386612121181093939";
const REDIRECT_URI = "https://touhoucardgamebackend.onrender.com/oauth/discord/callback";

function getDiscordAuthUrl() {
  const state = encodeURIComponent(window.location.href);
  return `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify&state=${state}`;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  global_name?: string;
}

export default function DiscordLogin() {
  const [user, setUser] = useState<User | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Récupère l'utilisateur uniquement si pas logout
  useEffect(() => {
    if (loggedOut) return;

    fetch("https://touhoucardgamebackend.onrender.com/oauth/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setUser)
      .catch(() => setUser(null));
  }, [loggedOut]);

  // Fermer popup si clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setIsPopupOpen(false);
    }
    if (isPopupOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopupOpen]);

  function handleLogout() {
    fetch("https://touhoucardgamebackend.onrender.com/oauth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setUser(null);
          setLoggedOut(true); // Bloque tout relog automatique
        }
      })
      .catch(console.error);
  }

  if (user) {
    const avatarUrl = user.avatar?.startsWith("a_")
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`
      : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

    return (
      <div className="fixed top-4 right-4 z-50" ref={popupRef}>
        <div className="relative inline-block">
          <div className="cursor-pointer" onClick={() => setIsPopupOpen((p) => !p)}>
            <img className="w-12 h-12 rounded-full" src={avatarUrl} alt="avatar" />
          </div>
          {isPopupOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white border rounded-md shadow p-3">
              <p className="text-center mb-2">Hello, {user.username}!</p>
              <button onClick={handleLogout} className="logout-btn">Log out</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="discord-login-container">
      <a className="discord-btn" href={getDiscordAuthUrl()}>Login</a>
    </div>
  );
}
