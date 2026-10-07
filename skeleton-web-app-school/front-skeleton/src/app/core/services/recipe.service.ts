import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, forkJoin, map, of, switchMap } from "rxjs"
import { environment } from "../../../environments/environment"
import { Recette, RecetteIngredient, RecipeFilters, RecipeGenerationRequest } from "core/models/recipe.model"
import { IngredientDto, RecipeDto } from "core/api/api.model"
import { toApiRegime, toApiTypeRepas, toRecette, toRecipeCreationDto } from "core/api/api.mappers"

@Injectable({ providedIn: "root" })
export class RecipeService {
  private readonly http = inject(HttpClient)
  private readonly recipesUrl = `${environment.apiUrl}/recipes`
  private readonly ingredientsUrl = `${environment.apiUrl}/ingredients`

  /** GET /api/recipes?dietType=&mealType= — filtres optionnels par régime et type de repas. */
  findAll(filters: RecipeFilters = {}): Observable<Recette[]> {
    let params = new HttpParams()
    if (filters.regime) params = params.set("dietType", toApiRegime(filters.regime)!)
    if (filters.typeRepas) params = params.set("mealType", toApiTypeRepas(filters.typeRepas))
    return this.http.get<RecipeDto[]>(this.recipesUrl, { params }).pipe(map((recipes) => recipes.map(toRecette)))
  }

  /** POST /api/recipes — création manuelle d'une recette. */
  create(recette: Recette): Observable<Recette> {
    return this.resolveIngredientIds(recette.ingredients ?? []).pipe(
      switchMap((ids) => this.http.post<RecipeDto>(this.recipesUrl, toRecipeCreationDto(recette, ids))),
      map(toRecette),
    )
  }

  /** POST /api/recipes/generate — proposition de recette + valeurs nutritionnelles par l'IA. */
  generate(request: RecipeGenerationRequest): Observable<Recette> {
    return this.http.post<Recette>(`${this.recipesUrl}/generate`, request)
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
