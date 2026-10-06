import { Component, inject, signal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { Observable, of } from "rxjs"
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

/** Demande une proposition de recette à l'IA, l'affiche, puis l'ajoute au catalogue. */
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

  /** Critères pré-remplis, par exemple depuis un créneau du planning. */
  private readonly initial = inject<Partial<RecipeGenerationRequest> | null>(MAT_DIALOG_DATA, { optional: true })

  readonly form = inject(FormBuilder).nonNullable.group({
    typeRepas: [this.initial?.typeRepas ?? ("MIDI" as TypeRepas), Validators.required],
    typeRegime: [
      this.initial?.typeRegime ?? inject(UserPreferencesService).regime() ?? ("VEGETARIEN" as Regime),
      Validators.required,
    ],
    consignes: ["", Validators.maxLength(300)],
  })

  generate(): void {
    if (this.form.invalid) return
    const { typeRepas, typeRegime, consignes } = this.form.getRawValue()
    this.loading.set(true)
    this.error.set(null)
    this.proposal.set(null)
    this.recipeService.generate({ typeRepas, typeRegime, consignes: consignes.trim() || undefined }).subscribe({
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

  /** Si le back a déjà enregistré la proposition (id présent), on la renvoie telle quelle ; sinon on la crée. */
  accept(): void {
    const recipe = this.proposal()
    if (!recipe) return
    const saved$: Observable<Recette> = recipe.id ? of(recipe) : this.recipeService.create(recipe)
    this.loading.set(true)
    saved$.subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (err) => {
        this.error.set(errorMessage(err))
        this.loading.set(false)
      },
    })
  }
}
