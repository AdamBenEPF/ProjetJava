import { Component, inject, signal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { REGIMES, Regime, TYPES_REPAS, TypeRepas } from "core/models/enums.model"
import { Recette } from "core/models/recipe.model"
import { RecipeService } from "core/services/recipe.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { RegimeLabelPipe } from "shared/pipes/regime-label.pipe"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"
import { IngredientFormRowComponent } from "../ingredient-form-row/ingredient-form-row.component"
import { IngredientFormGroup } from "../recipe-form.model"

/** Bornes issues du schéma SQL : DECIMAL(5,2) pour les macros, DECIMAL(6,2) pour les quantités. */
const MAX_MACRO = 999.99
const MAX_QUANTITE = 9999.99

@Component({
  selector: "app-recipe-form-dialog",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ErrorStateComponent,
    IngredientFormRowComponent,
    RegimeLabelPipe,
    TypeRepasLabelPipe,
  ],
  templateUrl: "./recipe-form-dialog.component.html",
  styleUrls: ["./recipe-form-dialog.component.scss"],
})
export class RecipeFormDialogComponent {
  private readonly fb = inject(FormBuilder).nonNullable
  private readonly recipeService = inject(RecipeService)
  private readonly dialogRef = inject<MatDialogRef<RecipeFormDialogComponent, Recette>>(MatDialogRef)

  readonly regimes = REGIMES
  readonly typesRepas = TYPES_REPAS
  readonly saving = signal(false)
  readonly error = signal<string | null>(null)

  readonly form = this.fb.group({
    titre: ["", [Validators.required, Validators.maxLength(150)]],
    typeRepas: ["MIDI" as TypeRepas, Validators.required],
    typeRegime: [inject(UserPreferencesService).regime() ?? ("VEGETARIEN" as Regime), Validators.required],
    calories: [null as number | null, [Validators.min(0)]],
    proteines: [null as number | null, [Validators.min(0), Validators.max(MAX_MACRO)]],
    glucides: [null as number | null, [Validators.min(0), Validators.max(MAX_MACRO)]],
    lipides: [null as number | null, [Validators.min(0), Validators.max(MAX_MACRO)]],
    ingredients: this.fb.array<IngredientFormGroup>([this.createIngredient()]),
  })

  get ingredients() {
    return this.form.controls.ingredients
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredient())
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index)
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const value = this.form.getRawValue()
    const recette: Recette = {
      ...value,
      ingredients: value.ingredients.map((line) => ({
        ingredient: { nom: line.nom.trim(), unite: line.unite },
        quantite: line.quantite ?? 0,
      })),
    }
    this.saving.set(true)
    this.error.set(null)
    this.recipeService.create(recette).subscribe({
      next: (created) => this.dialogRef.close(created),
      error: (err) => {
        this.error.set(errorMessage(err))
        this.saving.set(false)
      },
    })
  }

  private createIngredient(): IngredientFormGroup {
    return this.fb.group({
      nom: ["", [Validators.required, Validators.maxLength(100)]],
      unite: ["grammes", Validators.maxLength(50)],
      quantite: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(MAX_QUANTITE)]],
    })
  }
}
