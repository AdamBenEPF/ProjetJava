import { Component, OnInit, computed, inject, signal } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { Recette } from "core/models/recipe.model"
import { REGIME_LABELS } from "core/models/enums.model"
import { RecipeService } from "core/services/recipe.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { NotificationService } from "core/services/notification.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { PageHeaderComponent } from "shared/components/page-header/page-header.component"
import { LoadingStateComponent } from "shared/components/loading-state/loading-state.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { EmptyStateComponent } from "shared/components/empty-state/empty-state.component"
import { ConfirmDialogComponent, ConfirmDialogData } from "shared/components/confirm-dialog/confirm-dialog.component"
import { RecipeFilterState, RecipeFiltersComponent } from "../recipe-filters/recipe-filters.component"
import { RecipeCardComponent } from "../recipe-card/recipe-card.component"
import { RecipeDetailDialogComponent } from "../recipe-detail-dialog/recipe-detail-dialog.component"
import { RecipeFormDialogComponent } from "../recipe-form-dialog/recipe-form-dialog.component"
import {
  RecipeGenerateDialogComponent,
  RecipeGenerateDialogData,
} from "../recipe-generate-dialog/recipe-generate-dialog.component"

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
  private readonly userRegime = inject(UserPreferencesService).regime

  readonly recipes = signal<Recette[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  readonly filling = signal(false)
  readonly filters = signal<RecipeFilterState>({
    regime: this.userRegime(),
    typeRepas: null,
    search: "",
  })

  /** Régime et type de repas sont filtrés par `RecipeService.findAll`, la recherche texte ici. */
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

  /** Le back enregistre chaque recette générée : le catalogue est rechargé à la fermeture du dialogue. */
  openGenerate(): void {
    const data: RecipeGenerateDialogData = { actionLabel: "Voir la recette" }
    this.dialog
      .open(RecipeGenerateDialogComponent, { data, width: "640px", maxWidth: "95vw" })
      .afterClosed()
      .subscribe((recipe?: Recette) => {
        this.loadRecipes()
        if (recipe) this.openDetail(recipe)
      })
  }

  /** Ajoute une vingtaine de recettes générées par l'IA pour le régime filtré (ou celui de l'utilisateur). */
  fillWithAi(): void {
    const regime = this.filters().regime ?? this.userRegime() ?? "VIANDE"
    const data: ConfirmDialogData = {
      title: "Remplir le catalogue avec l'IA ?",
      message: `L'IA va générer et enregistrer une vingtaine de recettes « ${REGIME_LABELS[regime]} » avec leurs ingrédients. Cela peut prendre une minute.`,
      confirmLabel: "Générer",
    }
    this.dialog
      .open(ConfirmDialogComponent, { data, width: "460px", maxWidth: "95vw" })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return
        this.filling.set(true)
        this.recipeService.generateBatch(regime).subscribe({
          next: (count) => {
            this.filling.set(false)
            if (count) this.notification.success(`${count} recette(s) ajoutée(s) au catalogue`)
            else this.notification.error("L'IA n'a renvoyé aucune recette : vérifiez la clé GROQ_API_KEY du back.")
            this.loadRecipes()
          },
          error: (err) => {
            this.filling.set(false)
            this.notification.error(errorMessage(err))
          },
        })
      })
  }

  private onRecipeAdded(recipe: Recette, message: string): void {
    this.recipes.update((recipes) => [recipe, ...recipes])
    this.notification.success(`${message} : ${recipe.titre}`)
  }
}
