# Front — Planning Repas (Angular 17)

Application Angular en **composants standalone**, organisée par feature, qui consomme l'API REST Spring Boot.

## Installation et lancement

- Node JS : https://nodejs.org/en/download
- Angular CLI : `npm install -g @angular/cli`
- `npm i`

| Commande             | Usage                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------- |
| `npm start`          | Front sur `http://localhost:4200`, branché sur le back (`/api` → `localhost:8080` via `proxy.conf.json`, donc pas de souci de CORS). |
| `npm run start:mock` | Front avec une **API simulée en mémoire** (`core/mocks`) : permet de développer et faire une démo sans le back. Les données sont remises à zéro à chaque rechargement de page. |
| `npm run build`      | Build de production (`dist/`).                                                          |

## Architecture

```
src/app
├── app.config.ts / app.routes.ts   # bootstrap standalone, routes en lazy loading
├── core/                           # logique non visuelle
│   ├── models/                     # interfaces TypeScript calquées sur le modèle de données
│   ├── services/                   # HttpClient (recipe, meal-plan, shopping-list) + état (préférences, semaine) + export
│   ├── interceptors/               # traduction des erreurs HTTP, API mock
│   ├── mocks/                      # jeu de recettes de démonstration
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

## Contrat d'API attendu par le front

Toutes les routes sont préfixées par `/api` (voir `environment.apiUrl`). Les champs JSON reprennent les noms des colonnes en camelCase.

| Méthode | Route | Corps / paramètres | Réponse |
| ------- | ----- | ------------------ | ------- |
| GET | `/api/recipes` | `?regime=VEGAN&typeRepas=MIDI` (optionnels) | `Recette[]` |
| POST | `/api/recipes` | `Recette` (sans `id`) | `Recette` créée (201) |
| POST | `/api/recipes/generate` ⚠️ | `{ typeRepas, typeRegime, consignes? }` | `Recette` générée par l'IA (avec ou sans `id`) |
| GET | `/api/meal-plans` | `?userId=1&startDate=2026-10-05&endDate=2026-10-11` | `PlanningRepas[]` |
| POST | `/api/meal-plans` | `{ utilisateurId, recetteId, date, momentRepas }` | `PlanningRepas` créé (201) |
| DELETE | `/api/meal-plans/{id}` ⚠️ | — | 200 / 204 |
| GET | `/api/shopping-lists/{userId}` | `?startDate=&endDate=` | `ListeCourses` |

⚠️ = route ajoutée par rapport au cahier des charges (génération IA séparée de la création, suppression d'un repas du planning).

```jsonc
// Recette
{ "id": 1, "titre": "Buddha bowl", "typeRepas": "MIDI", "typeRegime": "VEGAN",
  "calories": 560, "proteines": 21.0, "glucides": 78.0, "lipides": 17.0,
  "ingredients": [ { "ingredient": { "id": 13, "nom": "Quinoa", "unite": "grammes" }, "quantite": 70 } ] }

// PlanningRepas
{ "id": 3, "utilisateurId": 1, "date": "2026-10-06", "momentRepas": "SOIR", "recette": { /* Recette */ } }

// ListeCourses
{ "id": 1, "utilisateurId": 1, "dateGeneration": "2026-10-06T10:15:00",
  "items": [ { "ingredientId": 13, "nom": "Quinoa", "unite": "grammes", "quantite": 210 } ] }
```

Erreurs : codes HTTP standards. Si le corps contient `{ "message": "..." }`, ce message est affiché tel quel à l'utilisateur.

## Exports

- **Planning** : CSV (Excel, séparateur `;`), agenda `.ics` (importable dans Google Agenda / Outlook), texte, impression / PDF.
- **Liste de courses** : CSV, checklist `.txt`, impression / PDF.

Les exports sont générés côté navigateur à partir des données déjà chargées. Les articles cochés de la liste de courses sont mémorisés dans le navigateur (par utilisateur et par semaine).
