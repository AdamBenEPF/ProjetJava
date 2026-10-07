import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from "@angular/common/http"
import { Observable, delay, of, throwError } from "rxjs"
import { environment } from "../../../environments/environment"
import { MOCK_RECIPES, MOCK_USERS } from "core/mocks/mock-data"
import { Recette, RecipeGenerationRequest } from "core/models/recipe.model"
import { PlanningRepas, PlanningRepasRequest } from "core/models/meal-plan.model"
import { ShoppingListItem } from "core/models/shopping-list.model"
import { IngredientDto, LoginDto, RecipeCreationDto, RegisterDto, UserDto, UserUpdateDto } from "core/api/api.model"
import { toApiRegime, toApiTypeRepas, toRecette, toRecipeDto } from "core/api/api.mappers"

const recipes: Recette[] = structuredClone(MOCK_RECIPES)
const ingredients: IngredientDto[] = uniqueIngredients(recipes)
const mealPlans: PlanningRepas[] = []
const users = structuredClone(MOCK_USERS)
let nextUserId = users.length + 1
let nextRecipeId = recipes.length + 1
let nextIngredientId = Math.max(0, ...ingredients.map((i) => i.id)) + 1
let nextPlanId = 1

const ok = <T>(body: T, status = 200) => of(new HttpResponse({ status, body })).pipe(delay(250))
const fail = (status: number, message: string) =>
  throwError(() => new HttpErrorResponse({ status, error: { message } })).pipe(delay(250))

/**
 * Simule le back Spring Boot en mémoire (activé par `environment.useMockApi`).
 * Respecte le même contrat JSON que l'API réelle (voir core/api/api.model.ts) afin de pouvoir basculer sans changer les services.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req)
  const path = req.url.slice(environment.apiUrl.length)
  return route(req, path) ?? fail(404, `Route simulée inconnue : ${req.method} ${path}`)
}

function route(req: HttpRequest<unknown>, path: string): Observable<HttpResponse<unknown>> | null {
  if (path === "/auth/login" && req.method === "POST") {
    const { email, password } = req.body as LoginDto
    const user = users.find((u) => u.email === email.trim().toLowerCase() && u.password === password)
    return user ? ok(toUserDto(user)) : fail(401, "Email ou mot de passe incorrect.")
  }
  if (path === "/auth/register" && req.method === "POST") {
    const body = req.body as RegisterDto
    const email = body.email.trim().toLowerCase()
    if (users.some((u) => u.email === email)) return fail(409, "Un compte existe déjà avec cet email.")
    const user = { ...body, email, id: nextUserId++ }
    users.push(user)
    return ok(toUserDto(user), 201)
  }
  const userMatch = path.match(/^\/users\/(\d+)$/)
  if (userMatch && req.method === "PUT") {
    const user = users.find((u) => u.id === Number(userMatch[1]))
    if (!user) return fail(404, "Utilisateur introuvable.")
    Object.assign(user, req.body as UserUpdateDto)
    return ok(toUserDto(user))
  }
  if (path === "/ingredients" && req.method === "GET") {
    return ok(ingredients)
  }
  if (path === "/ingredients" && req.method === "POST") {
    const ingredient = { ...(req.body as Omit<IngredientDto, "id">), id: nextIngredientId++ }
    ingredients.push(ingredient)
    return ok(ingredient)
  }
  if (path === "/recipes" && req.method === "GET") {
    const dietType = req.params.get("dietType")
    const mealType = req.params.get("mealType")
    const matches = recipes.filter(
      (r) =>
        (!dietType || toApiRegime(r.typeRegime) === dietType) && (!mealType || toApiTypeRepas(r.typeRepas) === mealType),
    )
    return ok(matches.map((r) => toRecipeDto({ ...r, id: r.id! })))
  }
  if (path === "/recipes" && req.method === "POST") {
    const { ingredients: lines, ...body } = req.body as RecipeCreationDto
    const dto = {
      ...body,
      id: nextRecipeId++,
      ingredients: lines.map(({ ingredientId, quantity }) => {
        const ingredient = ingredients.find((i) => i.id === ingredientId)
        return { ingredientId, name: ingredient?.name ?? "?", unit: ingredient?.unit ?? null, quantity }
      }),
    }
    recipes.push(toRecette(dto))
    return ok(dto, 201)
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

function toUserDto({ id, name, email, dietPreference }: UserDto): UserDto {
  return { id, name, email, dietPreference }
}

function uniqueIngredients(source: Recette[]): IngredientDto[] {
  const byId = new Map<number, IngredientDto>()
  for (const { ingredient } of source.flatMap((r) => r.ingredients ?? [])) {
    if (ingredient.id != null) byId.set(ingredient.id, { id: ingredient.id, name: ingredient.nom, unit: ingredient.unite })
  }
  return [...byId.values()]
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
