import { Component, EventEmitter, Input, Output } from "@angular/core"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-error-state",
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="error" role="alert">
      <mat-icon>error_outline</mat-icon>
      <span class="message">{{ message }}</span>
      @if (retryable) {
      <button mat-stroked-button color="warn" (click)="retry.emit()">Réessayer</button>
      }
    </div>
  `,
  styles: `
    .error {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 12px;
      background: var(--app-danger-soft);
      color: var(--app-danger);
    }
    .message {
      flex: 1;
    }
  `,
})
export class ErrorStateComponent {
  @Input({ required: true }) message!: string
  @Input() retryable = true
  @Output() retry = new EventEmitter<void>()
}
