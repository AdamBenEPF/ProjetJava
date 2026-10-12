import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, forkJoin, map, of, switchMap } from "rxjs"
import { environment } from "../../../environments/environment"
import { Regime } from "core/models/enums.model"
import { Recette, RecetteIngredient, RecipeFilters, RecipeGenerationRequest } from "core/models/recipe.model"
import { IngredientDto, RecipeDto, RecipeEntityDto, RecipeIngredientDto } from "core/api/api.model"
import { toApiRegime, toPersonalizedMealRequestDto, toRecette, toRecipeCreationDto } from "core/api/api.mappers"

@Injectable({ providedIn: "root" })
export class RecipeService {
  private readonly http = inject(HttpClient)
  private readonly recipesUrl = `${environment.apiUrl}/recipes`
  private readonly ingredientsUrl = `${environment.apiUrl}/ingredients`
  private readonly aiUrl = `${environment.apiUrl}/ai`

  /**
   * GET /api/recipes — filtres optionnels par régime et type de repas.
   * Le back filtre par égalité stricte, or l'IA enregistre parfois « Végétarien » ou « Déjeuner » au lieu de
   * « Vegetarian » ou « Lunch » : on récupère donc tout le catalogue et on filtre après normalisation des valeurs.
   */
  findAll(filters: RecipeFilters = {}): Observable<Recette[]> {
    return this.http.get<RecipeDto[]>(this.recipesUrl).pipe(
      map((recipes) =>
        recipes
          .map(toRecette)
          .filter(
            (recipe) =>
              (!filters.regime || recipe.typeRegime === filters.regime) &&
              (!filters.typeRepas || recipe.typeRepas === filters.typeRepas),
          ),
      ),
    )
  }

  /** POST /api/recipes — création manuelle d'une recette. */
  create(recette: Recette): Observable<Recette> {
    return this.resolveIngredientIds(recette.ingredients ?? []).pipe(
      switchMap((ids) => this.http.post<RecipeDto>(this.recipesUrl, toRecipeCreationDto(recette, ids))),
      map(toRecette),
    )
  }

  /**
   * POST /api/ai/personalized — l'IA génère une recette que le back enregistre directement dans le catalogue.
   * La réponse ne contient pas les ingrédients : on les récupère ensuite via GET /api/recipes/{id}/ingredients.
   */
  generate(request: RecipeGenerationRequest): Observable<Recette> {
    return this.http.post<RecipeEntityDto>(`${this.aiUrl}/personalized`, toPersonalizedMealRequestDto(request)).pipe(
      switchMap((recipe) =>
        this.http
          .get<RecipeIngredientDto[]>(`${this.recipesUrl}/${recipe.id}/ingredients`)
          .pipe(map((ingredients) => toRecette({ ...recipe, ingredients }))),
      ),
    )
  }

  /**
   * POST /api/ai/generate-and-save?dietType= — l'IA génère et enregistre une vingtaine de recettes variées
   * (4 lots de 5, soit environ une minute). Renvoie le nombre de recettes ajoutées au catalogue.
   */
  generateBatch(regime: Regime): Observable<number> {
    const params = new HttpParams().set("dietType", toApiRegime(regime)!)
    return this.http
      .post<RecipeEntityDto[]>(`${this.aiUrl}/generate-and-save`, null, { params })
      .pipe(map((recipes) => recipes.length))
  }

  /**
   * Le back attend des identifiants d'ingrédients : on réutilise ceux qui existent déjà (même nom)
   * et on crée les autres via POST /api/ingredients. Renvoie un identifiant par ligne, dans l'ordre.
   */
  private resolveIngredientIds(lines: RecetteIngredient[]): Observable<number[]> {
    if (!lines.length) return of([])
    const key = (name: string) => name.trim().toLowerCase()

    return this.http.get<IngredientDto[]>(this.ingredientsUrl).pipe(
      switchMap((existing) => {
        const idsByName = new Map(existing.map((ingredient) => [key(ingredient.name), ingredient.id]))
        const missing = new Map(
          lines
            .map(({ ingredient }) => ingredient)
            .filter((ingredient) => ingredient.id == null && !idsByName.has(key(ingredient.nom)))
            .map((ingredient) => [key(ingredient.nom), ingredient]),
        )
        const created = [...missing.values()].map((ingredient) =>
          this.http.post<IngredientDto>(this.ingredientsUrl, { name: ingredient.nom.trim(), unit: ingredient.unite }),
        )
        return (created.length ? forkJoin(created) : of([])).pipe(
          map((newIngredients) => {
            newIngredients.forEach((ingredient) => idsByName.set(key(ingredient.name), ingredient.id))
            return lines.map(({ ingredient }) => ingredient.id ?? idsByName.get(key(ingredient.nom))!)
          }),
        )
      }),
    )
  }
}
