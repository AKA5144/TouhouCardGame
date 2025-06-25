-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 25 juin 2025 à 14:15
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
CREATE DATABASE IF NOT EXISTS `touhou_decks` DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci;
USE `touhou_decks`;

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
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

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
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `deck`
--

INSERT INTO `deck` (`ID`, `name`, `image_url`, `image_hover_url`, `link`) VALUES
(1, 'Base Deck', '../Assets/Decks/Default/marisa-neutral.webp', '../Assets/Decks/Default/marisa-happy.webp', 'Deck.html');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
