import { Component, OnInit, computed, inject, signal } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { Recette } from "core/models/recipe.model"
import { RecipeService } from "core/services/recipe.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { NotificationService } from "core/services/notification.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { PageHeaderComponent } from "shared/components/page-header/page-header.component"
import { LoadingStateComponent } from "shared/components/loading-state/loading-state.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { EmptyStateComponent } from "shared/components/empty-state/empty-state.component"
import { RecipeFilterState, RecipeFiltersComponent } from "../recipe-filters/recipe-filters.component"
import { RecipeCardComponent } from "../recipe-card/recipe-card.component"
import { RecipeDetailDialogComponent } from "../recipe-detail-dialog/recipe-detail-dialog.component"
import { RecipeFormDialogComponent } from "../recipe-form-dialog/recipe-form-dialog.component"
import { RecipeGenerateDialogComponent } from "../recipe-generate-dialog/recipe-generate-dialog.component"

@Component({
  selector: "app-recipes-page",
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    RecipeFiltersComponent,
    RecipeCardComponent,
  ],
  templateUrl: "./recipes-page.component.html",
  styleUrls: ["./recipes-page.component.scss"],
})
export class RecipesPageComponent implements OnInit {
  private readonly recipeService = inject(RecipeService)
  private readonly dialog = inject(MatDialog)
  private readonly notification = inject(NotificationService)

  readonly recipes = signal<Recette[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  readonly filters = signal<RecipeFilterState>({
    regime: inject(UserPreferencesService).regime(),
    typeRepas: null,
    search: "",
  })

  /** La recherche texte est faite côté client ; régime et type de repas sont filtrés par l'API. */
  readonly visibleRecipes = computed(() => {
    const search = this.filters().search.trim().toLowerCase()
    if (!search) return this.recipes()
    return this.recipes().filter(
      (recipe) =>
        recipe.titre.toLowerCase().includes(search) ||
        recipe.ingredients?.some((line) => line.ingredient.nom.toLowerCase().includes(search)),
    )
  })

  ngOnInit(): void {
    this.loadRecipes()
  }

  loadRecipes(): void {
    const { regime, typeRepas } = this.filters()
    this.loading.set(true)
    this.error.set(null)
    this.recipeService.findAll({ regime, typeRepas }).subscribe({
      next: (recipes) => {
        this.recipes.set(recipes)
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set(errorMessage(err))
        this.loading.set(false)
      },
    })
  }

  onFiltersChange(filters: RecipeFilterState): void {
    const previous = this.filters()
    this.filters.set(filters)
    if (previous.regime !== filters.regime || previous.typeRepas !== filters.typeRepas) {
      this.loadRecipes()
    }
  }

  resetFilters(): void {
    this.onFiltersChange({ regime: null, typeRepas: null, search: "" })
  }

  openDetail(recipe: Recette): void {
    this.dialog.open(RecipeDetailDialogComponent, { data: recipe, width: "560px", maxWidth: "95vw" })
  }

  openCreate(): void {
    this.dialog
      .open(RecipeFormDialogComponent, { width: "760px", maxWidth: "95vw" })
      .afterClosed()
      .subscribe((recipe?: Recette) => recipe && this.onRecipeAdded(recipe, "Recette créée"))
  }

  openGenerate(): void {
    this.dialog
      .open(RecipeGenerateDialogComponent, { width: "640px", maxWidth: "95vw" })
      .afterClosed()
      .subscribe((recipe?: Recette) => recipe && this.onRecipeAdded(recipe, "Recette générée ajoutée"))
  }

  private onRecipeAdded(recipe: Recette, message: string): void {
    this.recipes.update((recipes) => [recipe, ...recipes])
    this.notification.success(`${message} : ${recipe.titre}`)
  }
}
