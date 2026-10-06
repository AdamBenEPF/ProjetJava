import { Component, EventEmitter, Input, Output } from "@angular/core"
import { ReactiveFormsModule } from "@angular/forms"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { IngredientFormGroup, UNITES } from "../recipe-form.model"

/** Une ligne « nom / quantité / unité » du formulaire de recette. */
@Component({
  selector: "app-ingredient-form-row",
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <div class="row-ingredient" [formGroup]="group">
      <mat-form-field appearance="outline" class="name" subscriptSizing="dynamic">
        <mat-label>Ingrédient {{ index + 1 }}</mat-label>
        <input matInput formControlName="nom" maxlength="100" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="quantity" subscriptSizing="dynamic">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" min="0" step="0.01" formControlName="quantite" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="unit" subscriptSizing="dynamic">
        <mat-label>Unité</mat-label>
        <mat-select formControlName="unite">
          @for (unite of unites; track unite) {
          <mat-option [value]="unite">{{ unite }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button
        mat-icon-button
        type="button"
        color="warn"
        [disabled]="!removable"
        (click)="remove.emit()"
        aria-label="Retirer l'ingrédient"
      >
        <mat-icon>delete_outline</mat-icon>
      </button>
    </div>
  `,
  styles: `
    .row-ingredient {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .name {
      flex: 2;
      min-width: 160px;
    }
    .quantity {
      width: 110px;
    }
    .unit {
      width: 170px;
    }
  `,
})
export class IngredientFormRowComponent {
  @Input({ required: true }) group!: IngredientFormGroup
  @Input() index = 0
  @Input() removable = true
  @Output() remove = new EventEmitter<void>()

  readonly unites = UNITES
}
