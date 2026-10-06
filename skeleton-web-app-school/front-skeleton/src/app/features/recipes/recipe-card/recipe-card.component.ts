import { Component, EventEmitter, Input, Output } from "@angular/core"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { Recette } from "core/models/recipe.model"
import { TypeRepas } from "core/models/enums.model"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"
import { NutritionSummaryComponent } from "shared/components/nutrition-summary/nutrition-summary.component"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"

const MEAL_EMOJIS: Record<TypeRepas, string> = {
  PETIT_DEJEUNER: "🥐",
  MIDI: "🍽️",
  SOIR: "🌙",
}

@Component({
  selector: "app-recipe-card",
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DietBadgeComponent,
    NutritionSummaryComponent,
    TypeRepasLabelPipe,
  ],
  templateUrl: "./recipe-card.component.html",
  styleUrls: ["./recipe-card.component.scss"],
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recette
  @Output() view = new EventEmitter<Recette>()

  readonly emojis = MEAL_EMOJIS
}
