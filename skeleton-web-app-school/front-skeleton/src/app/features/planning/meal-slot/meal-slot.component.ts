import { Component, EventEmitter, Input, Output } from "@angular/core"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatTooltipModule } from "@angular/material/tooltip"
import { TypeRepas } from "core/models/enums.model"
import { PlanningRepas } from "core/models/meal-plan.model"
import { TypeRepasLabelPipe } from "shared/pipes/type-repas-label.pipe"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"

/** Un créneau (petit-déjeuner, déjeuner ou dîner) d'une journée : vide ou rempli par une recette. */
@Component({
  selector: "app-meal-slot",
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TypeRepasLabelPipe, DietBadgeComponent],
  templateUrl: "./meal-slot.component.html",
  styleUrls: ["./meal-slot.component.scss"],
})
export class MealSlotComponent {
  @Input({ required: true }) moment!: TypeRepas
  @Input() plan?: PlanningRepas
  @Output() add = new EventEmitter<void>()
  @Output() remove = new EventEmitter<PlanningRepas>()
  @Output() view = new EventEmitter<PlanningRepas>()
}
