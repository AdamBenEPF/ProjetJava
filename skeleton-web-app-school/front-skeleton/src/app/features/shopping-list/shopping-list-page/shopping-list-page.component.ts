import { Component, computed, inject, signal } from "@angular/core"
import { DatePipe } from "@angular/common"
import { RouterLink } from "@angular/router"
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop"
import { catchError, of, switchMap, tap } from "rxjs"
import { MatButtonModule } from "@angular/material/button"
import { ListeCourses } from "core/models/shopping-list.model"
import { ShoppingListService } from "core/services/shopping-list.service"
import { SelectedWeekService } from "core/services/selected-week.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { ExportService, ShoppingListExportFormat } from "core/services/export.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { PageHeaderComponent } from "shared/components/page-header/page-header.component"
import { LoadingStateComponent } from "shared/components/loading-state/loading-state.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { EmptyStateComponent } from "shared/components/empty-state/empty-state.component"
import { ExportMenuComponent, ExportOption } from "shared/components/export-menu/export-menu.component"
import { WeekNavigatorComponent } from "shared/components/week-navigator/week-navigator.component"
import { ShoppingListItemsComponent } from "../shopping-list-items/shopping-list-items.component"
import { ShoppingProgressComponent } from "../shopping-progress/shopping-progress.component"
import { itemKey } from "../shopping-list.utils"

const CHECKED_STORAGE_PREFIX = "repas.courses."

@Component({
  selector: "app-shopping-list-page",
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    ExportMenuComponent,
    WeekNavigatorComponent,
    ShoppingListItemsComponent,
    ShoppingProgressComponent,
  ],
  templateUrl: "./shopping-list-page.component.html",
  styles: `
    .generated-at {
      font-size: 0.85rem;
      color: var(--app-text-muted);
    }
  `,
})
export class ShoppingListPageComponent {
  private readonly shoppingListService = inject(ShoppingListService)
  private readonly preferences = inject(UserPreferencesService)
  private readonly exportService = inject(ExportService)
  readonly week = inject(SelectedWeekService)

  readonly list = signal<ListeCourses | null>(null)
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  readonly checkedKeys = signal(new Set<string>())
  private readonly refresh = signal(0)

  readonly items = computed(() => this.list()?.items ?? [])
  readonly checkedCount = computed(() => this.items().filter((item) => this.checkedKeys().has(itemKey(item))).length)

  readonly exportOptions: ExportOption<ShoppingListExportFormat>[] = [
    { format: "csv", label: "Tableur (.csv)", icon: "table_view" },
    { format: "txt", label: "Checklist (.txt)", icon: "checklist" },
    { format: "print", label: "Imprimer / PDF", icon: "print" },
  ]

  private readonly query = computed(() => ({
    userId: this.preferences.userId(),
    start: this.week.startIso(),
    end: this.week.endIso(),
    refresh: this.refresh(),
  }))

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(({ userId, start }) => {
          this.loading.set(true)
          this.error.set(null)
          this.checkedKeys.set(this.loadChecked(userId, start))
        }),
        switchMap(({ userId, start, end }) =>
          this.shoppingListService.findForWeek(userId, start, end).pipe(
            catchError((err) => {
              this.error.set(errorMessage(err))
              return of(null)
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((list) => {
        this.list.set(list)
        this.loading.set(false)
      })
  }

  reload(): void {
    this.refresh.update((n) => n + 1)
  }

  toggle(key: string): void {
    const checked = new Set(this.checkedKeys())
    if (checked.has(key)) checked.delete(key)
    else checked.add(key)
    this.checkedKeys.set(checked)
    this.saveChecked(checked)
  }

  exportList(format: ShoppingListExportFormat): void {
    this.exportService.exportShoppingList(format, this.items(), this.week.startIso(), this.week.endIso())
  }

  /** Les articles cochés sont mémorisés par utilisateur et par semaine dans le navigateur. */
  private storageKey(userId: number, weekStart: string): string {
    return `${CHECKED_STORAGE_PREFIX}${userId}.${weekStart}`
  }

  private loadChecked(userId: number, weekStart: string): Set<string> {
    try {
      return new Set(JSON.parse(localStorage.getItem(this.storageKey(userId, weekStart)) ?? "[]"))
    } catch {
      return new Set()
    }
  }

  private saveChecked(checked: Set<string>): void {
    try {
      localStorage.setItem(
        this.storageKey(this.preferences.userId(), this.week.startIso()),
        JSON.stringify([...checked]),
      )
    } catch {
      // Stockage indisponible : l'état coché reste en mémoire.
    }
  }
}
