-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 02 juil. 2025 à 15:32
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `touhou_decks`
--

-- --------------------------------------------------------

--
-- Structure de la table `card`
--

DROP TABLE IF EXISTS `card`;
CREATE TABLE IF NOT EXISTS `card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `deck_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `card`
--

INSERT INTO `card` (`id`, `name`, `image_url`, `deck_id`) VALUES
(1, 'Marisa Kirisame', '../Assets/Decks/Default/marisa-neutral.webp', 1),
(2, 'Reimu Hakurei', '../Assets/Decks/Default/reimu-neutral.webp', 1),
(3, 'Satsuki Rin', '../Assets/Decks/Default/kirin-neutral.webp', 1);

-- --------------------------------------------------------

--
-- Structure de la table `deck`
--

DROP TABLE IF EXISTS `deck`;
CREATE TABLE IF NOT EXISTS `deck` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `image_hover_url` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `link` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `deck`
--

INSERT INTO `deck` (`ID`, `name`, `image_url`, `image_hover_url`, `link`) VALUES
(1, 'Base Deck', '../Assets/Decks/Default/marisa-neutral.webp', '../Assets/Decks/Default/marisa-happy.webp', 'Deck.html');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `discord_id` bigint NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `discriminator` varchar(10) NOT NULL,
  `avatar` varchar(128) NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NOT NULL,
  PRIMARY KEY (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`discord_id`, `username`, `discriminator`, `avatar`, `registered_at`, `last_login`) VALUES
(1046765964068393030, 'bingchilling5102', '0', 'c64fa18d6d6e961646ede5c9ba0b03dc', '2025-07-02 14:25:09', '2025-07-02 14:57:24'),
(1046765964068393031, 'test', '0', 'azaijdzaiddid', '2025-07-02 14:25:09', '2025-07-02 14:33:54');

-- --------------------------------------------------------

--
-- Structure de la table `user_cards`
--

DROP TABLE IF EXISTS `user_cards`;
CREATE TABLE IF NOT EXISTS `user_cards` (
  `discord_id` bigint NOT NULL,
  `card_id` int NOT NULL,
  `acquired_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`discord_id`,`card_id`),
  KEY `user_cards_ibfk_1` (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `user_cards`
--

INSERT INTO `user_cards` (`discord_id`, `card_id`, `acquired_at`) VALUES
(1046765964068393030, 1, '2025-07-02 16:57:05'),
(1046765964068393030, 2, '2025-07-02 16:57:13');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `user_cards`
--
ALTER TABLE `user_cards`
  ADD CONSTRAINT `user_cards_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `card` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `user_cards_ibfk_2` FOREIGN KEY (`discord_id`) REFERENCES `users` (`discord_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
