import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, forkJoin, map } from "rxjs"
import { environment } from "../../../environments/environment"
import { PlanningRepas, PlanningRepasRequest } from "core/models/meal-plan.model"
import { MealPlanDto } from "core/api/api.model"
import { toMealPlanDto, toPlanningRepas } from "core/api/api.mappers"
import { RecipeService } from "./recipe.service"

@Injectable({ providedIn: "root" })
export class MealPlanService {
  private readonly http = inject(HttpClient)
  private readonly recipeService = inject(RecipeService)
  private readonly mealPlansUrl = `${environment.apiUrl}/meal-plans`

  /**
   * GET /api/meal-plans/user/{userId} — le back renvoie tout le planning avec seulement l'id des recettes :
   * on garde la période demandée et on y rattache les recettes du catalogue.
   */
  findByPeriod(userId: number, startDate: string, endDate: string): Observable<PlanningRepas[]> {
    return forkJoin([
      this.http.get<MealPlanDto[]>(`${this.mealPlansUrl}/user/${userId}`),
      this.recipeService.findAll(),
    ]).pipe(
      map(([plans, recipes]) => {
        const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]))
        return plans
          .filter((plan) => plan.date >= startDate && plan.date <= endDate && recipesById.has(plan.recipeId))
          .map((plan) => toPlanningRepas(plan, recipesById.get(plan.recipeId)!))
      }),
    )
  }

  /** POST /api/meal-plans — assigne une recette à un créneau du calendrier (la recette n'est pas renvoyée). */
  assign(request: PlanningRepasRequest): Observable<Omit<PlanningRepas, "recette">> {
    return this.http.post<MealPlanDto>(this.mealPlansUrl, toMealPlanDto(request)).pipe(
      map((plan) => ({
        id: plan.id,
        utilisateurId: plan.userId,
        date: plan.date,
        momentRepas: request.momentRepas,
      })),
    )
  }

  /** DELETE /api/meal-plans/{id} — retire un repas du calendrier. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.mealPlansUrl}/${id}`)
  }
}
