import { Component, Input } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"

/** Message affiché quand une liste est vide ; les actions sont projetées via `<ng-content>`. */
@Component({
  selector: "app-empty-state",
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty">
      <mat-icon class="icon" aria-hidden="true">{{ icon }}</mat-icon>
      <h2>{{ title }}</h2>
      @if (message) {
      <p>{{ message }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 16px;
      border: 2px dashed var(--app-border);
      border-radius: 16px;
      color: var(--app-text-muted);
    }
    .icon {
      width: 48px;
      height: 48px;
      font-size: 48px;
      color: var(--app-primary);
    }
    h2 {
      margin: 12px 0 4px;
      font-size: 1.2rem;
      color: var(--app-text);
    }
    p {
      max-width: 420px;
    }
  `,
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string
  @Input() message?: string
  @Input() icon = "inbox"
}
