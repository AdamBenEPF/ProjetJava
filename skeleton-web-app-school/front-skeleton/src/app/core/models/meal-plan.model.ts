import { TypeRepas } from "./enums.model"
import { Recette } from "./recipe.model"

/** Table `planning_repas`, telle que renvoyée par `GET /api/meal-plans`. */
export interface PlanningRepas {
  id?: number
  utilisateurId: number
  recette: Recette
  /** Format ISO `YYYY-MM-DD`. */
  date: string
  momentRepas: TypeRepas
}

/** Corps de `POST /api/meal-plans`. */
export interface PlanningRepasRequest {
  utilisateurId: number
  recetteId: number
  date: string
  momentRepas: TypeRepas
}
