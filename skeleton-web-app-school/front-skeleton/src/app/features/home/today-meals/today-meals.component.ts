import { Component, OnInit, inject, signal } from "@angular/core"
import { RouterLink } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { TYPES_REPAS, TypeRepas } from "core/models/enums.model"
import { PlanningRepas } from "core/models/meal-plan.model"
import { MealPlanService } from "core/services/meal-plan.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { toIsoDate } from "core/utils/date.utils"
import { LoadingStateComponent } from "shared/components/loading-state/loading-state.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"

/** Aperçu des trois repas planifiés pour aujourd'hui. */
@Component({
  selector: "app-today-meals",
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, LoadingStateComponent, ErrorStateComponent, TypeRepasLabelPipe],
  templateUrl: "./today-meals.component.html",
  styleUrls: ["./today-meals.component.scss"],
})
export class TodayMealsComponent implements OnInit {
  private readonly mealPlanService = inject(MealPlanService)
  private readonly userId = inject(UserPreferencesService).userId

  readonly moments = TYPES_REPAS
  readonly meals = signal<Partial<Record<TypeRepas, PlanningRepas>>>({})
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    const today = toIsoDate(new Date())
    this.loading.set(true)
    this.error.set(null)
    this.mealPlanService.findByPeriod(this.userId(), today, today).subscribe({
      next: (plans) => {
        this.meals.set(Object.fromEntries(plans.map((plan) => [plan.momentRepas, plan])))
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set(errorMessage(err))
        this.loading.set(false)
      },
    })
  }
}
