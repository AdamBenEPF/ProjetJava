import { Component, computed, inject, signal } from "@angular/core"
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop"
import { Observable, catchError, of, switchMap, tap } from "rxjs"
import { MatDialog } from "@angular/material/dialog"
import { PlanningRepas } from "core/models/meal-plan.model"
import { Recette } from "core/models/recipe.model"
import { MealPlanService } from "core/services/meal-plan.service"
import { SelectedWeekService } from "core/services/selected-week.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { NotificationService } from "core/services/notification.service"
import { ExportFormat, ExportService } from "core/services/export.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { fromIsoDate } from "core/utils/date.utils"
import { PageHeaderComponent } from "shared/components/page-header/page-header.component"
import { LoadingStateComponent } from "shared/components/loading-state/loading-state.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { ExportMenuComponent, ExportOption } from "shared/components/export-menu/export-menu.component"
import { WeekNavigatorComponent } from "shared/components/week-navigator/week-navigator.component"
import { RecipeDetailDialogComponent } from "features/recipes/recipe-detail-dialog/recipe-detail-dialog.component"
import { WeekCalendarComponent } from "../week-calendar/week-calendar.component"
import { WeekSummaryComponent } from "../week-summary/week-summary.component"
import { RecipePickerData, RecipePickerDialogComponent } from "../recipe-picker-dialog/recipe-picker-dialog.component"
import { MealSlot } from "../planning.model"

@Component({
  selector: "app-planning-page",
  standalone: true,
  imports: [
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    ExportMenuComponent,
    WeekNavigatorComponent,
    WeekCalendarComponent,
    WeekSummaryComponent,
  ],
  templateUrl: "./planning-page.component.html",
})
export class PlanningPageComponent {
  private readonly mealPlanService = inject(MealPlanService)
  private readonly preferences = inject(UserPreferencesService)
  private readonly notification = inject(NotificationService)
  private readonly exportService = inject(ExportService)
  private readonly dialog = inject(MatDialog)
  readonly week = inject(SelectedWeekService)

  readonly plans = signal<PlanningRepas[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  private readonly refresh = signal(0)

  readonly exportOptions: ExportOption<ExportFormat>[] = [
    { format: "csv", label: "Tableur (.csv)", icon: "table_view" },
    { format: "ics", label: "Agenda (.ics)", icon: "event" },
    { format: "txt", label: "Texte (.txt)", icon: "description" },
    { format: "print", label: "Imprimer / PDF", icon: "print" },
  ]

  /** Toute modification de l'utilisateur, de la semaine ou un « Réessayer » relance le chargement. */
  private readonly query = computed(() => ({
    userId: this.preferences.userId(),
    start: this.week.startIso(),
    end: this.week.endIso(),
    refresh: this.refresh(),
  }))

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => {
          this.loading.set(true)
          this.error.set(null)
        }),
        switchMap(({ userId, start, end }) =>
          this.mealPlanService.findByPeriod(userId, start, end).pipe(
            catchError((err) => {
              this.error.set(errorMessage(err))
              return of(null)
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((plans) => {
        if (plans) this.plans.set(plans)
        this.loading.set(false)
      })
  }

  reload(): void {
    this.refresh.update((n) => n + 1)
  }

  openPicker(slot: MealSlot): void {
    const data: RecipePickerData = {
      typeRepas: slot.moment,
      regime: this.preferences.regime(),
      dayLabel: fromIsoDate(slot.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
    }
    this.dialog
      .open(RecipePickerDialogComponent, { data, width: "640px", maxWidth: "95vw" })
      .afterClosed()
      .subscribe((recipe?: Recette) => recipe && this.assign(slot, recipe))
  }

  viewRecipe(plan: PlanningRepas): void {
    this.dialog.open(RecipeDetailDialogComponent, { data: plan.recette, width: "560px", maxWidth: "95vw" })
  }

  removeMeal(plan: PlanningRepas): void {
    if (plan.id == null) return
    this.mealPlanService.remove(plan.id).subscribe({
      next: () => {
        this.plans.update((plans) => plans.filter((p) => p.id !== plan.id))
        this.notification.success(`« ${plan.recette.titre} » retiré du planning`)
      },
      error: (err) => this.notification.error(errorMessage(err)),
    })
  }

  exportPlanning(format: ExportFormat): void {
    this.exportService.exportPlanning(format, this.plans(), this.week.startIso(), this.week.endIso())
  }

  /** Un créneau ne contient qu'un repas : s'il est déjà occupé, l'ancien est retiré avant l'ajout. */
  private assign(slot: MealSlot, recipe: Recette): void {
    if (recipe.id == null) return
    const existing = this.plans().find((p) => p.date === slot.date && p.momentRepas === slot.moment)
    const removeExisting$: Observable<unknown> =
      existing?.id != null ? this.mealPlanService.remove(existing.id) : of(null)
    const request = {
      utilisateurId: this.preferences.userId(),
      recetteId: recipe.id,
      date: slot.date,
      momentRepas: slot.moment,
    }

    removeExisting$.pipe(switchMap(() => this.mealPlanService.assign(request))).subscribe({
      next: (created) => {
        const plan: PlanningRepas = { ...created, recette: recipe }
        this.plans.update((plans) => [...plans.filter((p) => p !== existing), plan])
        this.notification.success(`« ${recipe.titre} » ajouté au planning`)
      },
      error: (err) => {
        this.notification.error(errorMessage(err))
        this.reload()
      },
    })
  }
}
