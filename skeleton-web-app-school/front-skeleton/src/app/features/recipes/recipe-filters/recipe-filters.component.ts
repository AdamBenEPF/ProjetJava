import { Component, EventEmitter, Input, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatIconModule } from "@angular/material/icon"
import { REGIMES, Regime, TYPES_REPAS, TypeRepas } from "core/models/enums.model"
import { RegimeLabelPipe } from "shared/pipes/regime-label.pipe"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"

export interface RecipeFilterState {
  regime: Regime | null
  typeRepas: TypeRepas | null
  search: string
}

@Component({
  selector: "app-recipe-filters",
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    RegimeLabelPipe,
    TypeRepasLabelPipe,
  ],
  templateUrl: "./recipe-filters.component.html",
  styleUrls: ["./recipe-filters.component.scss"],
})
export class RecipeFiltersComponent {
  @Input({ required: true }) filters!: RecipeFilterState
  @Output() filtersChange = new EventEmitter<RecipeFilterState>()

  readonly regimes = REGIMES
  readonly typesRepas = TYPES_REPAS

  update(patch: Partial<RecipeFilterState>): void {
    this.filtersChange.emit({ ...this.filters, ...patch })
  }
}
