import { Routes } from "@angular/router"

/** Chaque feature est chargée à la demande (lazy loading de composants standalone). */
export const routes: Routes = [
  {
    path: "",
    title: "Accueil · Planning Repas",
    loadComponent: () => import("features/home/home-page/home-page.component").then((m) => m.HomePageComponent),
  },
  {
    path: "recettes",
    title: "Recettes · Planning Repas",
    loadComponent: () =>
      import("features/recipes/recipes-page/recipes-page.component").then((m) => m.RecipesPageComponent),
  },
  {
    path: "planning",
    title: "Planning · Planning Repas",
    loadComponent: () =>
      import("features/planning/planning-page/planning-page.component").then((m) => m.PlanningPageComponent),
  },
  {
    path: "courses",
    title: "Liste de courses · Planning Repas",
    loadComponent: () =>
      import("features/shopping-list/shopping-list-page/shopping-list-page.component").then(
        (m) => m.ShoppingListPageComponent,
      ),
  },
  {
    path: "preferences",
    title: "Préférences · Planning Repas",
    loadComponent: () =>
      import("features/preferences/preferences-page/preferences-page.component").then(
        (m) => m.PreferencesPageComponent,
      ),
  },
  { path: "**", redirectTo: "" },
]
