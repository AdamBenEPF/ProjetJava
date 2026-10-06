import { Component, OnInit, computed, inject, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatIconModule } from "@angular/material/icon"
import { MatSlideToggleModule } from "@angular/material/slide-toggle"
import { Regime, TypeRepas } from "core/models/enums.model"
import { Recette } from "core/models/recipe.model"
import { RecipeService } from "core/services/recipe.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { LoadingStateComponent } from "shared/components/loading-state/loading-state.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"
import { NutritionSummaryComponent } from "shared/components/nutrition-summary/nutrition-summary.component"
import { RegimeLabelPipe } from "shared/pipes/regime-label.pipe"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"
import { RecipeGenerateDialogComponent } from "features/recipes/recipe-generate-dialog/recipe-generate-dialog.component"

export interface RecipePickerData {
  typeRepas: TypeRepas
  regime: Regime | null
  dayLabel: string
}

/** Choix d'une recette pour un créneau du planning (ou génération d'une nouvelle par l'IA). */
@Component({
  selector: "app-recipe-picker-dialog",
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    LoadingStateComponent,
    ErrorStateComponent,
    DietBadgeComponent,
    NutritionSummaryComponent,
    RegimeLabelPipe,
    TypeRepasLabelPipe,
  ],
  templateUrl: "./recipe-picker-dialog.component.html",
  styleUrls: ["./recipe-picker-dialog.component.scss"],
})
export class RecipePickerDialogComponent implements OnInit {
  private readonly recipeService = inject(RecipeService)
  private readonly dialog = inject(MatDialog)
  private readonly dialogRef = inject<MatDialogRef<RecipePickerDialogComponent, Recette>>(MatDialogRef)
  readonly data: RecipePickerData = inject(MAT_DIALOG_DATA)

  readonly recipes = signal<Recette[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  readonly search = signal("")
  /** Par défaut, seules les recettes du régime de l'utilisateur sont proposées. */
  readonly onlyMyDiet = signal(this.data.regime !== null)

  readonly filtered = computed(() => {
    const search = this.search().trim().toLowerCase()
    return this.recipes().filter((recipe) => recipe.titre.toLowerCase().includes(search))
  })

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.loading.set(true)
    this.error.set(null)
    const regime = this.onlyMyDiet() ? this.data.regime : null
    this.recipeService.findAll({ typeRepas: this.data.typeRepas, regime }).subscribe({
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

  toggleDietFilter(onlyMyDiet: boolean): void {
    this.onlyMyDiet.set(onlyMyDiet)
    this.load()
  }

  select(recipe: Recette): void {
    this.dialogRef.close(recipe)
  }

  generateWithAi(): void {
    this.dialog
      .open(RecipeGenerateDialogComponent, {
        width: "640px",
        maxWidth: "95vw",
        data: { typeRepas: this.data.typeRepas, typeRegime: this.data.regime ?? undefined },
      })
      .afterClosed()
      .subscribe((recipe?: Recette) => recipe && this.select(recipe))
  }
}
