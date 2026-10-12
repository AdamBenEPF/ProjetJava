import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, forkJoin, map, of, switchMap } from "rxjs"
import { environment } from "../../../environments/environment"
import { PlanningRepas } from "core/models/meal-plan.model"
import { ListeCourses, ShoppingListItem } from "core/models/shopping-list.model"
import { ShoppingListDto } from "core/api/api.model"
import { MealPlanService } from "./meal-plan.service"

/**
 * Liste de courses de la semaine.
 * Le back (`/api/shopping-lists`) n'enregistre qu'une date de génération par liste, sans les articles :
 * ceux-ci sont donc calculés à partir du planning et des ingrédients des recettes.
 */
@Injectable({ providedIn: "root" })
export class ShoppingListService {
  private readonly http = inject(HttpClient)
  private readonly mealPlanService = inject(MealPlanService)
  private readonly shoppingListsUrl = `${environment.apiUrl}/shopping-lists`

  /** Articles de la semaine + dernière liste générée (GET /api/shopping-lists/user/{userId}). */
  findForWeek(userId: number, startDate: string, endDate: string): Observable<ListeCourses> {
    return forkJoin([this.mealPlanService.findByPeriod(userId, startDate, endDate), this.findByUser(userId)]).pipe(
      map(([plans, lists]) => {
        const latest = lists[lists.length - 1]
        return {
          id: latest?.id,
          utilisateurId: userId,
          dateGeneration: latest?.dateGeneration ?? undefined,
          items: aggregate(plans),
        }
      }),
    )
  }

  /**
   * POST /api/shopping-lists/generate/{userId} — enregistre une nouvelle génération,
   * puis supprime les précédentes (DELETE /api/shopping-lists/{id}) : seule la dernière est affichée.
   */
  generate(userId: number): Observable<ShoppingListDto> {
    return this.findByUser(userId).pipe(
      switchMap((previous) =>
        this.http
          .post<ShoppingListDto>(`${this.shoppingListsUrl}/generate/${userId}`, null)
          .pipe(switchMap((created) => this.deleteAll(previous).pipe(map(() => created)))),
      ),
    )
  }

  private deleteAll(lists: ShoppingListDto[]): Observable<unknown> {
    if (!lists.length) return of(null)
    return forkJoin(lists.map((list) => this.http.delete<void>(`${this.shoppingListsUrl}/${list.id}`)))
  }

  /** Listes de l'utilisateur, de la plus ancienne à la plus récente. */
  private findByUser(userId: number): Observable<ShoppingListDto[]> {
    return this.http
      .get<ShoppingListDto[]>(`${this.shoppingListsUrl}/user/${userId}`)
      .pipe(map((lists) => [...lists].sort((a, b) => (a.dateGeneration ?? "").localeCompare(b.dateGeneration ?? ""))))
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
