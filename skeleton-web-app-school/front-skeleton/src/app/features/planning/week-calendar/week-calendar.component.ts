import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core"
import { TypeRepas } from "core/models/enums.model"
import { PlanningRepas } from "core/models/meal-plan.model"
import { isSameDay, toIsoDate } from "core/utils/date.utils"
import { DayColumnComponent } from "../day-column/day-column.component"
import { MealSlot } from "../planning.model"

type PlansByDay = Partial<Record<string, Partial<Record<TypeRepas, PlanningRepas>>>>

/** Grille de la semaine : répartit les repas planifiés par jour et par créneau. */
@Component({
  selector: "app-week-calendar",
  standalone: true,
  imports: [DayColumnComponent],
  template: `
    <div class="calendar">
      @for (day of days; track day.getTime()) {
      <app-day-column
        [date]="day"
        [isToday]="isToday(day)"
        [plansByMoment]="plansByDay[iso(day)] ?? {}"
        (addMeal)="addMeal.emit({ date: iso(day), moment: $event })"
        (removeMeal)="removeMeal.emit($event)"
        (viewMeal)="viewMeal.emit($event)"
      ></app-day-column>
      }
    </div>
  `,
  styles: `
    .calendar {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 10px;
    }
    @media (max-width: 1100px) {
      .calendar {
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      }
    }
  `,
})
export class WeekCalendarComponent implements OnChanges {
  @Input({ required: true }) days!: Date[]
  @Input() plans: PlanningRepas[] = []
  @Output() addMeal = new EventEmitter<MealSlot>()
  @Output() removeMeal = new EventEmitter<PlanningRepas>()
  @Output() viewMeal = new EventEmitter<PlanningRepas>()

  plansByDay: PlansByDay = {}
  private readonly today = new Date()

  ngOnChanges(): void {
    this.plansByDay = {}
    for (const plan of this.plans) {
      ;(this.plansByDay[plan.date] ??= {})[plan.momentRepas] = plan
    }
  }

  iso(day: Date): string {
    return toIsoDate(day)
  }

  isToday(day: Date): boolean {
    return isSameDay(day, this.today)
  }
}
