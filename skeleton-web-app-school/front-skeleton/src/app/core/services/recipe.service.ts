import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { Recette, RecipeFilters, RecipeGenerationRequest } from "core/models/recipe.model"

@Injectable({ providedIn: "root" })
export class RecipeService {
  private readonly http = inject(HttpClient)
  private readonly recipesUrl = `${environment.apiUrl}/recipes`

  /** GET /api/recipes — filtres optionnels par régime et type de repas. */
  findAll(filters: RecipeFilters = {}): Observable<Recette[]> {
    let params = new HttpParams()
    if (filters.regime) params = params.set("regime", filters.regime)
    if (filters.typeRepas) params = params.set("typeRepas", filters.typeRepas)
    return this.http.get<Recette[]>(this.recipesUrl, { params })
  }

  /** POST /api/recipes — création manuelle d'une recette. */
  create(recette: Recette): Observable<Recette> {
    return this.http.post<Recette>(this.recipesUrl, recette)
  }

  /** POST /api/recipes/generate — proposition de recette + valeurs nutritionnelles par l'IA. */
  generate(request: RecipeGenerationRequest): Observable<Recette> {
    return this.http.post<Recette>(`${this.recipesUrl}/generate`, request)
  }
}
