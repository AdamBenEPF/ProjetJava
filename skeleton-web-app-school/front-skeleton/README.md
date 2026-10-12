# Front — Planning Repas (Angular 17)

Application Angular en **composants standalone**, organisée par feature, qui consomme l'API REST Spring Boot.

## Installation et lancement

- Node JS : https://nodejs.org/en/download
- Angular CLI : `npm install -g @angular/cli`
- `npm i`

| Commande        | Usage                                                                                   |
| --------------- | --------------------------------------------------------------------------------------- |
| `npm start`     | Front sur `http://localhost:4200`, branché sur le back (`/api` → `localhost:8080` via `proxy.conf.json`, donc pas de souci de CORS). |
| `npm run build` | Build de production (`dist/`), qui appelle directement `http://localhost:8080/api`.     |

Le back (`back-app`) et sa base PostgreSQL doivent être démarrés : toutes les données viennent de l'API.
La génération par l'IA nécessite la variable `GROQ_API_KEY` côté back.

## Architecture

```
src/app
├── app.config.ts / app.routes.ts   # bootstrap standalone, routes en lazy loading
├── core/                           # logique non visuelle
│   ├── api/                        # contrat JSON du back (api.model) et conversions vers les modèles du front (api.mappers)
│   ├── models/                     # interfaces TypeScript utilisées par les composants
│   ├── services/                   # HttpClient (auth, recipe, meal-plan, shopping-list, préférences) + état (semaine) + export
│   ├── interceptors/               # traduction des erreurs HTTP
│   ├── guards/                     # pages réservées aux utilisateurs connectés
│   └── utils/                      # dates, téléchargement de fichiers
├── layout/navbar/
├── shared/                         # composants et pipes réutilisables
│   ├── components/                 # page-header, loading/error/empty-state, diet-badge,
│   │                               # nutrition-summary, export-menu, week-navigator
│   └── pipes/                      # regimeLabel, typeRepasLabel
└── features/
    ├── home/                       # home-page, feature-card, today-meals
    ├── recipes/                    # recipes-page, recipe-filters, recipe-card, recipe-detail-dialog,
    │                               # recipe-form-dialog, ingredient-form-row, recipe-generate-dialog,
    │                               # recipe-ingredients-list
    ├── planning/                   # planning-page, week-summary, week-calendar, day-column,
    │                               # meal-slot, recipe-picker-dialog
    ├── shopping-list/              # shopping-list-page, shopping-progress, shopping-list-items,
    │                               # shopping-list-item
    └── preferences/                # preferences-page, diet-selector
```

Les pages (`*-page`) chargent les données et gèrent l'état ; les autres composants ne reçoivent que des `@Input` et émettent des `@Output`.

## Routes du back utilisées

Toutes les routes sont préfixées par `/api` (voir `environment.apiUrl`). Les services convertissent les valeurs du back
(`"Vegetarian"`, `"Lunch"`…) vers celles du front (`VEGETARIEN`, `MIDI`…) dans `core/api/api.mappers.ts`.

| Méthode | Route | Utilisée par |
| ------- | ----- | ------------ |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/register` | Inscription |
| GET | `/api/users/{id}` | Resynchronisation de la session au démarrage (déconnexion si le compte n'existe plus) |
| PUT | `/api/users/{id}` | Préférences (nom, régime) |
| DELETE | `/api/users/{id}` | Préférences : « Supprimer mon compte » (planning et listes supprimés en cascade) |
| GET | `/api/recipes` | Catalogue, choix d'une recette pour le planning, planning (recettes des repas) |
| POST | `/api/recipes` | Création manuelle d'une recette |
| GET / POST | `/api/ingredients` | Création d'une recette : réutilise les ingrédients existants, crée les autres |
| POST | `/api/ai/personalized` | Génération d'une recette par l'IA (enregistrée directement par le back) |
| POST | `/api/ai/generate-and-save` | Recettes : « Remplir avec l'IA » (une vingtaine de recettes pour un régime) |
| GET | `/api/recipes/{id}/ingredients` | Ingrédients de la recette générée par l'IA |
| GET | `/api/meal-plans/user/{userId}` | Planning, repas du jour, liste de courses |
| POST | `/api/meal-plans` | Ajout d'un repas au planning |
| DELETE | `/api/meal-plans/{id}` | Retrait / remplacement d'un repas |
| GET | `/api/shopping-lists/user/{userId}` | Date de la dernière liste de courses générée |
| POST | `/api/shopping-lists/generate/{userId}` | Bouton « Générer la liste » |
| DELETE | `/api/shopping-lists/{id}` | Suppression des générations précédentes |

Le back n'enregistre que la date de génération d'une liste de courses : les articles sont calculés côté front
en additionnant les ingrédients des recettes planifiées sur la semaine.

Erreurs : codes HTTP standards. Si le corps contient `{ "message": "..." }`, ce message est affiché tel quel à l'utilisateur.

## Exports

- **Planning** : CSV (Excel, séparateur `;`), agenda `.ics` (importable dans Google Agenda / Outlook), texte, impression / PDF.
- **Liste de courses** : CSV, checklist `.txt`, impression / PDF.

Les exports sont générés côté navigateur à partir des données déjà chargées. Les articles cochés de la liste de courses sont mémorisés dans le navigateur (par utilisateur et par semaine).
