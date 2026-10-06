import { Component, Input } from "@angular/core"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"

@Component({
  selector: "app-loading-state",
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading" role="status">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <span>{{ message }}</span>
    </div>
  `,
  styles: `
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 16px;
      color: var(--app-text-muted);
    }
  `,
})
export class LoadingStateComponent {
  @Input() message = "Chargement…"
  @Input() diameter = 40
}
