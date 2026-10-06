import { Regime, TypeRepas } from "./enums.model"

/** Table `ingredient`. */
export interface Ingredient {
  id?: number
  nom: string
  unite: string
}

/** Table de liaison `recette_ingredient`. */
export interface RecetteIngredient {
  ingredient: Ingredient
  quantite: number
}

/** Table `recette`. */
export interface Recette {
  id?: number
  titre: string
  typeRepas: TypeRepas
  typeRegime: Regime
  calories?: number | null
  proteines?: number | null
  glucides?: number | null
  lipides?: number | null
  ingredients?: RecetteIngredient[]
}

/** Filtres optionnels de `GET /api/recipes`. */
export interface RecipeFilters {
  regime?: Regime | null
  typeRepas?: TypeRepas | null
}

/** Corps de la requête de génération d'une recette par l'IA. */
export interface RecipeGenerationRequest {
  typeRepas: TypeRepas
  typeRegime: Regime
  consignes?: string
}
