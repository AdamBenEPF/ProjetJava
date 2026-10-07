import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from "@angular/common/http"
import { Observable, delay, of, throwError } from "rxjs"
import { environment } from "../../../environments/environment"
import { MOCK_RECIPES, MOCK_USERS } from "core/mocks/mock-data"
import { Recette } from "core/models/recipe.model"
import {
  IngredientDto,
  LoginDto,
  MealPlanDto,
  RecipeCreationDto,
  RecipeDto,
  RegisterDto,
  UserDto,
  UserUpdateDto,
} from "core/api/api.model"
import { fromApiRegime, fromApiTypeRepas, toApiRegime, toApiTypeRepas, toRecette, toRecipeDto } from "core/api/api.mappers"

const recipes: Recette[] = structuredClone(MOCK_RECIPES)
const ingredients: IngredientDto[] = uniqueIngredients(recipes)
const mealPlans: MealPlanDto[] = []
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
  if (path === "/ai/suggest" && req.method === "GET") {
    return ok(suggestRecipe(req.params.get("dietType"), req.params.get("mealType"), req.params.get("instructions"))).pipe(
      delay(1200),
    )
  }
  const userPlansMatch = path.match(/^\/meal-plans\/user\/(\d+)$/)
  if (userPlansMatch && req.method === "GET") {
    return ok(mealPlans.filter((p) => p.userId === Number(userPlansMatch[1])))
  }
  if (path === "/meal-plans" && req.method === "POST") {
    const plan = { ...(req.body as Omit<MealPlanDto, "id">), id: nextPlanId++ }
    mealPlans.push(plan)
    return ok(plan)
  }
  const mealPlanMatch = path.match(/^\/meal-plans\/(\d+)$/)
  if (mealPlanMatch && req.method === "DELETE") {
    const index = mealPlans.findIndex((p) => p.id === Number(mealPlanMatch[1]))
    if (index >= 0) mealPlans.splice(index, 1)
    return ok(null)
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

/** Comme GET /api/ai/suggest : une proposition sans id, construite à partir d'une recette de démonstration. */
function suggestRecipe(dietType: string | null, mealType: string | null, instructions: string | null): RecipeDto {
  const regime = fromApiRegime(dietType) ?? "VEGETARIEN"
  const typeRepas = fromApiTypeRepas(mealType) ?? "MIDI"
  const base =
    MOCK_RECIPES.find((r) => r.typeRepas === typeRepas && r.typeRegime === regime) ??
    MOCK_RECIPES.find((r) => r.typeRepas === typeRepas) ??
    MOCK_RECIPES[0]
  const dto = toRecipeDto({ ...base, id: 0, typeRepas, typeRegime: regime })
  return {
    ...dto,
    id: null,
    title: `${base.titre} (variante IA${instructions ? ` : ${instructions}` : ""})`,
    ingredients: dto.ingredients.map((line) => ({ ...line, ingredientId: null })),
  }
}
