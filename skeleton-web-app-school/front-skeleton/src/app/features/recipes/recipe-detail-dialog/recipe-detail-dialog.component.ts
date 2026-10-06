import { Component, inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { Recette } from "core/models/recipe.model"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"
import { NutritionSummaryComponent } from "shared/components/nutrition-summary/nutrition-summary.component"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"
import { RecipeIngredientsListComponent } from "../recipe-ingredients-list/recipe-ingredients-list.component"

@Component({
  selector: "app-recipe-detail-dialog",
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    DietBadgeComponent,
    NutritionSummaryComponent,
    RecipeIngredientsListComponent,
    TypeRepasLabelPipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ recipe.titre }}</h2>
    <mat-dialog-content>
      <div class="tags">
        <span class="meal-type">{{ recipe.typeRepas | typeRepasLabel }}</span>
        <app-diet-badge [regime]="recipe.typeRegime"></app-diet-badge>
      </div>
      <h3>Valeurs nutritionnelles</h3>
      <app-nutrition-summary [values]="recipe"></app-nutrition-summary>
      <h3>Ingrédients</h3>
      <app-recipe-ingredients-list [ingredients]="recipe.ingredients ?? []"></app-recipe-ingredients-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: `
    .tags {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .meal-type {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--app-text-muted);
    }
    h3 {
      margin: 20px 0 8px;
      font-size: 1rem;
      font-weight: 600;
    }
  `,
})
export class RecipeDetailDialogComponent {
  readonly recipe: Recette = inject(MAT_DIALOG_DATA)
}
