import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { ListeCourses } from "core/models/shopping-list.model"

@Injectable({ providedIn: "root" })
export class ShoppingListService {
  private readonly http = inject(HttpClient)
  private readonly shoppingListsUrl = `${environment.apiUrl}/shopping-lists`

  /** GET /api/shopping-lists/{userId} — liste agrégée des ingrédients du planning de la semaine. */
  findForWeek(userId: number, startDate: string, endDate: string): Observable<ListeCourses> {
    const params = new HttpParams().set("startDate", startDate).set("endDate", endDate)
    return this.http.get<ListeCourses>(`${this.shoppingListsUrl}/${userId}`, { params })
  }
}
