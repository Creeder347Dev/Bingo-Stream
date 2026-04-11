Voici une version **100% copiable sans aucun bloc spécial ni formatage parasite** :

---

# 🎯 Bingo Stream

![Status](https://img.shields.io/badge/status-active-success)
![Made with](https://img.shields.io/badge/made%20with-JavaScript-blue)

Un bingo interactif, dynamique et personnalisable pour stream (Twitch, Vtuber, communauté).

---

## 🚀 Démo

👉 [https://creeder347dev.github.io/Bingo-Stream/](https://creeder347dev.github.io/Bingo-Stream/)

---

## 🎥 Preview

![Bingo Preview](./preview.gif)

---

## ✨ Features

* Génération aléatoire de grille
* Texte automatiquement ajusté à la taille des cases
* Configuration via config.json
* Bouton reset
* Responsive (1080p / 1440p / OBS)
* Cases carrées parfaites
* JavaScript vanilla

---

## 📁 Structure du projet

```
Bingo-Stream/
├── index.html
├── style.css
├── script.js
├── config.json
└── preview.gif
```
---

## ⚙️ Configuration

### Taille de la grille

Dans config.json :

{
"gridSize": 5
}

---

### Ajouter des phrases
```
{
"phrases": [
"C’est quoi ton setup ?",
"Tu stream quand ?",
"Pourquoi ça lag ?"
]
}
```
---

## ▶️ Lancer en local

python -m http.server

Puis ouvrir :
[http://localhost:8000](http://localhost:8000)

---

## 🧠 Fonctionnement

1. Chargement du JSON
2. Mélange des phrases
3. Génération de la grille
4. Ajustement du texte
5. Détection du bingo

---

## 🎮 Utilisation

* OBS (source navigateur)
* Interaction chat
* Jeu communautaire

---

## 📜 Licence

Libre d’utilisation

---

## 👤 Auteur

Créé par Creeder347
