import { Component, inject } from "@angular/core"
import { DatePipe } from "@angular/common"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatTooltipModule } from "@angular/material/tooltip"
import { SelectedWeekService } from "core/services/selected-week.service"

/** Navigation semaine précédente / suivante, partagée par le planning et la liste de courses. */
@Component({
  selector: "app-week-navigator",
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="navigator">
      <button
        mat-icon-button
        class="no-print"
        (click)="week.previous()"
        matTooltip="Semaine précédente"
        aria-label="Semaine précédente"
      >
        <mat-icon>chevron_left</mat-icon>
      </button>
      <span class="label">
        Semaine du {{ week.weekStart() | date : "d MMMM" }} au {{ week.weekEnd() | date : "d MMMM y" }}
      </span>
      <button
        mat-icon-button
        class="no-print"
        (click)="week.next()"
        matTooltip="Semaine suivante"
        aria-label="Semaine suivante"
      >
        <mat-icon>chevron_right</mat-icon>
      </button>
      <button mat-button class="no-print" color="primary" (click)="week.today()">Aujourd'hui</button>
    </div>
  `,
  styles: `
    .navigator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      margin-bottom: 20px;
      border-radius: 999px;
      background: var(--app-surface);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }
    .label {
      min-width: 260px;
      text-align: center;
      font-weight: 500;
    }
  `,
})
export class WeekNavigatorComponent {
  readonly week = inject(SelectedWeekService)
}
