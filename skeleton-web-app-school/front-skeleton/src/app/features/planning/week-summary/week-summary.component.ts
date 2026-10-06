import { Component, Input } from "@angular/core"
import { DecimalPipe } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"
import { PlanningRepas } from "core/models/meal-plan.model"

const SLOTS_PER_WEEK = 21

/** Indicateurs de la semaine : repas planifiés, moyenne calorique et total des macronutriments. */
@Component({
  selector: "app-week-summary",
  standalone: true,
  imports: [DecimalPipe, MatIconModule],
  templateUrl: "./week-summary.component.html",
  styleUrls: ["./week-summary.component.scss"],
})
export class WeekSummaryComponent {
  @Input() set plans(plans: PlanningRepas[]) {
    const sum = (key: "calories" | "proteines" | "glucides" | "lipides") =>
      plans.reduce((total, plan) => total + (plan.recette[key] ?? 0), 0)
    const days = new Set(plans.map((plan) => plan.date)).size
    this.mealCount = plans.length
    this.totalCalories = sum("calories")
    this.averageCalories = days ? this.totalCalories / days : 0
    this.proteines = sum("proteines")
    this.glucides = sum("glucides")
    this.lipides = sum("lipides")
  }

  readonly slotsPerWeek = SLOTS_PER_WEEK
  mealCount = 0
  totalCalories = 0
  averageCalories = 0
  proteines = 0
  glucides = 0
  lipides = 0
}
