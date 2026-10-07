import { Injectable, inject } from "@angular/core"
import { Observable, map } from "rxjs"
import { PlanningRepas } from "core/models/meal-plan.model"
import { ListeCourses, ShoppingListItem } from "core/models/shopping-list.model"
import { MealPlanService } from "./meal-plan.service"

/**
 * Liste de courses de la semaine, calculée à partir du planning et des ingrédients des recettes.
 * Le back (`/api/shopping-lists`) n'enregistre qu'une date de génération, sans les ingrédients : on ne l'utilise donc pas ici.
 */
@Injectable({ providedIn: "root" })
export class ShoppingListService {
  private readonly mealPlanService = inject(MealPlanService)

  findForWeek(userId: number, startDate: string, endDate: string): Observable<ListeCourses> {
    return this.mealPlanService
      .findByPeriod(userId, startDate, endDate)
      .pipe(map((plans) => ({ utilisateurId: userId, dateGeneration: new Date().toISOString(), items: aggregate(plans) })))
  }
}

/** Somme des quantités d'un même ingrédient (même nom et même unité) sur tous les repas planifiés. */
function aggregate(plans: PlanningRepas[]): ShoppingListItem[] {
  const items = new Map<string, ShoppingListItem>()
  for (const { ingredient, quantite } of plans.flatMap((plan) => plan.recette.ingredients ?? [])) {
    const key = `${ingredient.nom}|${ingredient.unite}`
    const existing = items.get(key)
    if (existing) existing.quantite += quantite
    else items.set(key, { ingredientId: ingredient.id, nom: ingredient.nom, unite: ingredient.unite, quantite })
  }
  return [...items.values()].sort((a, b) => a.nom.localeCompare(b.nom))
}
