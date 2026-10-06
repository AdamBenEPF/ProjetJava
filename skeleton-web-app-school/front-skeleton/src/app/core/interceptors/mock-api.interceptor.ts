import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from "@angular/common/http"
import { Observable, delay, of, throwError } from "rxjs"
import { environment } from "../../../environments/environment"
import { MOCK_RECIPES } from "core/mocks/mock-data"
import { Recette, RecipeGenerationRequest } from "core/models/recipe.model"
import { PlanningRepas, PlanningRepasRequest } from "core/models/meal-plan.model"
import { ShoppingListItem } from "core/models/shopping-list.model"

const recipes: Recette[] = structuredClone(MOCK_RECIPES)
const mealPlans: PlanningRepas[] = []
let nextRecipeId = recipes.length + 1
let nextPlanId = 1

const ok = <T>(body: T, status = 200) => of(new HttpResponse({ status, body })).pipe(delay(250))
const fail = (status: number, message: string) =>
  throwError(() => new HttpErrorResponse({ status, error: { message } })).pipe(delay(250))

/**
 * Simule le back Spring Boot en mémoire (activé par `environment.useMockApi`).
 * Respecte le même contrat que l'API réelle afin de pouvoir basculer sans changer les composants.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req)
  const path = req.url.slice(environment.apiUrl.length)
  return route(req, path) ?? fail(404, `Route simulée inconnue : ${req.method} ${path}`)
}

function route(req: HttpRequest<unknown>, path: string): Observable<HttpResponse<unknown>> | null {
  if (path === "/recipes" && req.method === "GET") {
    const regime = req.params.get("regime")
    const typeRepas = req.params.get("typeRepas")
    return ok(recipes.filter((r) => (!regime || r.typeRegime === regime) && (!typeRepas || r.typeRepas === typeRepas)))
  }
  if (path === "/recipes" && req.method === "POST") {
    const recipe = { ...(req.body as Recette), id: nextRecipeId++ }
    recipes.push(recipe)
    return ok(recipe, 201)
  }
  if (path === "/recipes/generate" && req.method === "POST") {
    return ok(generateRecipe(req.body as RecipeGenerationRequest), 201).pipe(delay(1200))
  }
  if (path === "/meal-plans" && req.method === "GET") {
    const userId = Number(req.params.get("userId"))
    const start = req.params.get("startDate") ?? ""
    const end = req.params.get("endDate") ?? ""
    return ok(plansInPeriod(userId, start, end))
  }
  if (path === "/meal-plans" && req.method === "POST") {
    const body = req.body as PlanningRepasRequest
    const recette = recipes.find((r) => r.id === body.recetteId)
    if (!recette) return fail(404, "Recette introuvable.")
    const plan: PlanningRepas = {
      id: nextPlanId++,
      utilisateurId: body.utilisateurId,
      recette,
      date: body.date,
      momentRepas: body.momentRepas,
    }
    mealPlans.push(plan)
    return ok(plan, 201)
  }
  const mealPlanMatch = path.match(/^\/meal-plans\/(\d+)$/)
  if (mealPlanMatch && req.method === "DELETE") {
    const index = mealPlans.findIndex((p) => p.id === Number(mealPlanMatch[1]))
    if (index < 0) return fail(404, "Repas introuvable dans le planning.")
    mealPlans.splice(index, 1)
    return ok(null)
  }
  const shoppingMatch = path.match(/^\/shopping-lists\/(\d+)$/)
  if (shoppingMatch && req.method === "GET") {
    const userId = Number(shoppingMatch[1])
    const plans = plansInPeriod(userId, req.params.get("startDate") ?? "", req.params.get("endDate") ?? "9999")
    return ok({ id: 1, utilisateurId: userId, dateGeneration: new Date().toISOString(), items: aggregate(plans) })
  }
  return null
}

function plansInPeriod(userId: number, start: string, end: string): PlanningRepas[] {
  return mealPlans.filter((p) => p.utilisateurId === userId && p.date >= start && p.date <= end)
}

function aggregate(plans: PlanningRepas[]): ShoppingListItem[] {
  const items = new Map<string, ShoppingListItem>()
  for (const { ingredient, quantite } of plans.flatMap((p) => p.recette.ingredients ?? [])) {
    const key = `${ingredient.nom}|${ingredient.unite}`
    const existing = items.get(key)
    if (existing) existing.quantite += quantite
    else items.set(key, { ingredientId: ingredient.id, nom: ingredient.nom, unite: ingredient.unite, quantite })
  }
  return [...items.values()].sort((a, b) => a.nom.localeCompare(b.nom))
}

function generateRecipe(request: RecipeGenerationRequest): Recette {
  const candidates = MOCK_RECIPES.filter(
    (r) => r.typeRepas === request.typeRepas && r.typeRegime === request.typeRegime,
  )
  const base = candidates[0] ?? MOCK_RECIPES.find((r) => r.typeRepas === request.typeRepas) ?? MOCK_RECIPES[0]
  const recipe: Recette = {
    ...structuredClone(base),
    id: nextRecipeId++,
    titre: `${base.titre} (variante IA${request.consignes ? ` : ${request.consignes}` : ""})`,
    typeRepas: request.typeRepas,
    typeRegime: request.typeRegime,
  }
  recipes.push(recipe)
  return recipe
}
