import { Component, Input } from "@angular/core"
import { RouterLink } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-feature-card",
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <a class="feature" [routerLink]="link">
      <mat-icon class="icon" aria-hidden="true">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <span class="cta">{{ cta }} <mat-icon>arrow_forward</mat-icon></span>
    </a>
  `,
  styles: `
    .feature {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 20px;
      border-radius: 16px;
      background: var(--app-surface);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      color: inherit;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .feature:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }
    .icon {
      width: 44px;
      height: 44px;
      font-size: 26px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: var(--app-primary-soft);
      color: var(--app-primary);
    }
    h3 {
      margin: 14px 0 6px;
      font-size: 1.1rem;
      font-weight: 600;
    }
    p {
      flex: 1;
      color: var(--app-text-muted);
    }
    .cta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      color: var(--app-primary);
    }
  `,
})
export class FeatureCardComponent {
  @Input({ required: true }) title!: string
  @Input({ required: true }) description!: string
  @Input({ required: true }) icon!: string
  @Input({ required: true }) link!: string
  @Input() cta = "Ouvrir"
}
