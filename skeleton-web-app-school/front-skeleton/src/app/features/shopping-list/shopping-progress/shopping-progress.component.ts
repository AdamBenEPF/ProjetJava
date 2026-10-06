import { Component, Input } from "@angular/core"
import { MatProgressBarModule } from "@angular/material/progress-bar"

@Component({
  selector: "app-shopping-progress",
  standalone: true,
  imports: [MatProgressBarModule],
  template: `
    <div class="progress no-print">
      <div class="labels">
        <span>{{ done }} / {{ total }} article(s) dans le panier</span>
        <span class="percent">{{ percent }} %</span>
      </div>
      <mat-progress-bar mode="determinate" [value]="percent"></mat-progress-bar>
    </div>
  `,
  styles: `
    .progress {
      margin-bottom: 16px;
    }
    .labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 0.9rem;
      color: var(--app-text-muted);
    }
    .percent {
      font-weight: 600;
      color: var(--app-primary);
    }
  `,
})
export class ShoppingProgressComponent {
  @Input() done = 0
  @Input() total = 0

  get percent(): number {
    return this.total ? Math.round((this.done / this.total) * 100) : 0
  }
}
