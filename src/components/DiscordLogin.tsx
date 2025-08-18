import { useEffect, useRef, useState } from "react";
import "../Style/common/discord.css";

// Discord OAuth settings
const CLIENT_ID = "1386612121181093939";
const REDIRECT_URI = "https://touhoucardgamebackend.onrender.com/oauth/discord/callback";

function getDiscordAuthUrl() {
  const currentUrl = window.location.href; 
  const state = encodeURIComponent(currentUrl);
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
  const popupRef = useRef<HTMLDivElement>(null);

  // Fetch current user on mount
  useEffect(() => {
    fetch("https://touhoucardgamebackend.onrender.com/oauth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    }

    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen]);

  // Logout handler
  function handleLogout() {
    fetch("https://touhoucardgamebackend.onrender.com/oauth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setUser(null);
          window.location.reload();
        }
      })
      .catch((err) => console.error("Erreur lors de la déconnexion :", err));
  }

  if (user) {
    const isGif = user.avatar?.startsWith("a_");
    const avatarUrl = isGif
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`
      : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

    return (
      <div className="fixed top-4 right-4 z-50" ref={popupRef}>
        <div className="relative inline-block">
          <div className="cursor-pointer" onClick={() => setIsPopupOpen((prev) => !prev)}>
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-full"
            />
          </div>
          {isPopupOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md z-50 shadow-lg p-3">
              <p className="text-black text-[10px] sm:text-sm text-center mb-2">
                Hello, {user.username}!
              </p>
              <button onClick={handleLogout} className="logout-btn">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="discord-login-container" className="w-12 sm:w-32 md:w-40 lg:w-48">
      <a className="discord-btn text-[6px] sm:text-sm md:text-base lg:text-lg" href={getDiscordAuthUrl()}>
        Login
      </a>
    </div>
  );
}
