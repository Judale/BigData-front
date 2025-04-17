# Frontend Vite + React

Ce document explique comment installer et lancer le projet React basé sur Vite sur macOS/Linux et Windows.

---

## Prérequis

- **Node.js 16+** et **npm** (ou **yarn**) installés
- **Git** (optionnel, pour le versionnage)

---

## Installation du projet

Clonez le dépôt et placez-vous dans le dossier `frontend` :

```bash
git clone https://github.com/Judale/BigData-front.git
cd BigData-front
```

### Installez les dépendances

#### Sur macOS / Linux

```bash
# Avec npm
pm install

# Avec yarn (si vous préférez)
yarn install
```

#### Sur Windows (PowerShell)

```powershell
# Avec npm
npm install

# Avec yarn (si vous préférez)
yarn install
```

---

## Scripts disponibles

| Script         | Description                                  |
|----------------|----------------------------------------------|
| `npm run dev`  | Démarre le serveur de développement Vite      |
| `npm run build`| Construit l’application pour la production   |
| `npm run preview`| Aperçu du build de production             |
| `npm run lint` | Lance ESLint sur le projet                   |

Vous pouvez remplacer `npm` par `yarn` selon votre gestionnaire de paquets.

---

## Lancer l’application

#### Développement
```bash
npm run dev
```
- Accessible par défaut sur `http://localhost:5173`.

#### Aperçu du build
```bash
npm run preview
```
- Permet de tester localement le build de production.

#### Build de production
```bash
npm run build
```
- Le résultat est généré dans le dossier `dist/`.

---

## Structure du projet

```
frontend/
├── public/            # Fichiers statiques (favicon, index.html)
├── src/
│   ├── assets/        # Images, styles, etc.
│   ├── components/    # Composants React
│   ├── hooks/         # Custom Hooks
│   ├── pages/         # Pages routeées
│   ├── App.jsx        # Composant racine
│   ├── main.jsx       # Point d’entrée de Vite
│   └── router.jsx     # Configuration de React Router
├── .eslintrc.js       # Configuration ESLint
├── package.json       # Dépendances et scripts
└── vite.config.js     # Configuration Vite
```

---

## Configuration optionnelle

- **ESLint** : adapté pour React, Hooks et la syntaxe moderne.
- **Variables d’environnement** : créez un fichier `.env` à la racine pour définir vos clés API lors du développement.

---

## Licence

Ajoutez ici votre licence (ex. MIT, Apache 2.0, etc.).

