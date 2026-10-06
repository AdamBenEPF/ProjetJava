import { Component, EventEmitter, Input, Output } from "@angular/core"
import { DatePipe } from "@angular/common"
import { TYPES_REPAS, TypeRepas } from "core/models/enums.model"
import { PlanningRepas } from "core/models/meal-plan.model"
import { MealSlotComponent } from "../meal-slot/meal-slot.component"

/** Une journée du calendrier : ses trois créneaux et le total calorique. */
@Component({
  selector: "app-day-column",
  standalone: true,
  imports: [DatePipe, MealSlotComponent],
  template: `
    <section class="day" [class.today]="isToday">
      <header>
        <span class="weekday">{{ date | date : "EEEE" }}</span>
        <span class="date">{{ date | date : "d MMM" }}</span>
      </header>
      @for (moment of moments; track moment) {
      <app-meal-slot
        [moment]="moment"
        [plan]="plansByMoment[moment]"
        (add)="addMeal.emit(moment)"
        (remove)="removeMeal.emit($event)"
        (view)="viewMeal.emit($event)"
      ></app-meal-slot>
      }
      <footer>{{ totalCalories }} kcal</footer>
    </section>
  `,
  styles: `
    .day {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 100%;
      padding: 10px;
      border-radius: 14px;
      background: var(--app-surface-alt);
    }
    .today {
      outline: 2px solid var(--app-primary);
    }
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .weekday {
      font-weight: 600;
      text-transform: capitalize;
    }
    .date {
      font-size: 0.8rem;
      color: var(--app-text-muted);
    }
    footer {
      margin-top: auto;
      text-align: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--app-accent);
    }
  `,
})
export class DayColumnComponent {
  @Input({ required: true }) date!: Date
  @Input() plansByMoment: Partial<Record<TypeRepas, PlanningRepas>> = {}
  @Input() isToday = false
  @Output() addMeal = new EventEmitter<TypeRepas>()
  @Output() removeMeal = new EventEmitter<PlanningRepas>()
  @Output() viewMeal = new EventEmitter<PlanningRepas>()

  readonly moments = TYPES_REPAS

  get totalCalories(): number {
    return Object.values(this.plansByMoment).reduce((sum, plan) => sum + (plan?.recette.calories ?? 0), 0)
  }
}
