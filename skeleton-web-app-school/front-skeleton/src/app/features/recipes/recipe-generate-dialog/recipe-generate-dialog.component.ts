import { Component, inject, signal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { REGIMES, Regime, TYPES_REPAS, TypeRepas } from "core/models/enums.model"
import { Recette, RecipeGenerationRequest } from "core/models/recipe.model"
import { RecipeService } from "core/services/recipe.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { LoadingStateComponent } from "shared/components/loading-state/loading-state.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { NutritionSummaryComponent } from "shared/components/nutrition-summary/nutrition-summary.component"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"
import { RegimeLabelPipe } from "shared/pipes/regime-label.pipe"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"
import { RecipeIngredientsListComponent } from "../recipe-ingredients-list/recipe-ingredients-list.component"

/** Données d'ouverture : critères pré-remplis (ex. depuis un créneau du planning) et libellé du bouton de choix. */
export interface RecipeGenerateDialogData extends Partial<RecipeGenerationRequest> {
  actionLabel?: string
}

/**
 * Demande une recette à l'IA selon des critères (POST /api/ai/personalized) et l'affiche.
 * Le back l'enregistre dès sa génération : le dialogue renvoie la recette choisie, ou rien s'il est simplement fermé.
 */
@Component({
  selector: "app-recipe-generate-dialog",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    LoadingStateComponent,
    ErrorStateComponent,
    NutritionSummaryComponent,
    DietBadgeComponent,
    RecipeIngredientsListComponent,
    RegimeLabelPipe,
    TypeRepasLabelPipe,
  ],
  templateUrl: "./recipe-generate-dialog.component.html",
  styleUrls: ["./recipe-generate-dialog.component.scss"],
})
export class RecipeGenerateDialogComponent {
  private readonly recipeService = inject(RecipeService)
  private readonly dialogRef = inject<MatDialogRef<RecipeGenerateDialogComponent, Recette>>(MatDialogRef)

  readonly regimes = REGIMES
  readonly typesRepas = TYPES_REPAS
  readonly loading = signal(false)
  readonly error = signal<string | null>(null)
  readonly proposal = signal<Recette | null>(null)

  private readonly initial = inject<RecipeGenerateDialogData | null>(MAT_DIALOG_DATA, { optional: true })
  readonly actionLabel = this.initial?.actionLabel ?? "Choisir cette recette"

  readonly form = inject(FormBuilder).nonNullable.group({
    typeRepas: [this.initial?.typeRepas ?? ("MIDI" as TypeRepas), Validators.required],
    typeRegime: [
      this.initial?.typeRegime ?? inject(UserPreferencesService).regime() ?? ("VEGETARIEN" as Regime),
      Validators.required,
    ],
    caloriesCibles: [null as number | null, [Validators.min(0), Validators.max(5000)]],
    proteinesCibles: [null as number | null, [Validators.min(0), Validators.max(500)]],
    ingredientObligatoire: ["", Validators.maxLength(100)],
    consignes: ["", Validators.maxLength(300)],
  })

  generate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading.set(true)
    this.error.set(null)
    this.proposal.set(null)
    this.recipeService.generate(this.form.getRawValue()).subscribe({
      next: (recipe) => {
        this.proposal.set(recipe)
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set(errorMessage(err))
        this.loading.set(false)
      },
    })
  }

  choose(recipe: Recette): void {
    this.dialogRef.close(recipe)
  }
}
