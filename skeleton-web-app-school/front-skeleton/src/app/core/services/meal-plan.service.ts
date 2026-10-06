import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { PlanningRepas, PlanningRepasRequest } from "core/models/meal-plan.model"

@Injectable({ providedIn: "root" })
export class MealPlanService {
  private readonly http = inject(HttpClient)
  private readonly mealPlansUrl = `${environment.apiUrl}/meal-plans`

  /** GET /api/meal-plans?userId=&startDate=&endDate= */
  findByPeriod(userId: number, startDate: string, endDate: string): Observable<PlanningRepas[]> {
    const params = new HttpParams().set("userId", userId).set("startDate", startDate).set("endDate", endDate)
    return this.http.get<PlanningRepas[]>(this.mealPlansUrl, { params })
  }

  /** POST /api/meal-plans — assigne une recette à un créneau du calendrier. */
  assign(request: PlanningRepasRequest): Observable<PlanningRepas> {
    return this.http.post<PlanningRepas>(this.mealPlansUrl, request)
  }

  /** DELETE /api/meal-plans/{id} — retire un repas du calendrier. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.mealPlansUrl}/${id}`)
  }
}
