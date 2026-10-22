import { Component } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"

/** Chapitre « Planning » de la vidéo d'introduction : la semaine se remplit jour après jour. */
@Component({
  selector: "app-intro-planning-scene",
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="week" role="img" aria-label="Planning d'une semaine rempli jour après jour">
      <span></span>
      @for (day of days; track day) {
        <span class="day">{{ day }}</span>
      }
      @for (meal of meals; track meal.label; let m = $index) {
        <span class="moment"><span aria-hidden="true">{{ meal.icon }}</span> <span class="label">{{ meal.label }}</span></span>
        @for (dish of meal.dishes; track d; let d = $index) {
          <span class="slot"><span class="dish" [style.--i]="d * 3 + m">{{ dish }}</span></span>
        }
      }
    </div>
    <p class="summary">
      <mat-icon>local_fire_department</mat-icon>
      21 repas planifiés · environ 1 900 kcal par jour
    </p>
  `,
  styles: `
    .week {
      display: grid;
      grid-template-columns: auto repeat(7, 1fr);
      gap: 8px;
      align-items: center;
    }
    .day {
      font-weight: 600;
    }
    .moment {
      padding-right: 8px;
      font-size: 0.9rem;
      text-align: left;
      white-space: nowrap;
    }
    .slot {
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      max-height: 80px;
      border: 2px dashed rgba(255, 255, 255, 0.35);
      border-radius: 14px;
    }
    .dish {
      display: grid;
      place-items: center;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      border-radius: 14px;
      background: var(--app-surface);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      font-size: clamp(1.1rem, 3vw, 2rem);
      animation: drop 0.4s calc(0.6s + var(--i) * 0.1s) cubic-bezier(0.3, 1.5, 0.5, 1) both;
    }
    .summary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 24px 0 0;
      padding: 8px 18px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.15);
      font-weight: 500;
      animation: drop 0.5s 3s both;
    }
    @keyframes drop {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.6);
      }
    }
    @media (max-width: 600px) {
      .week {
        gap: 4px;
      }
      .label {
        display: none;
      }
      .slot,
      .dish {
        border-radius: 8px;
      }
    }
  `,
})
export class IntroPlanningSceneComponent {
  readonly days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  readonly meals = [
    { icon: "🌅", label: "Petit-déj.", dishes: ["🥐", "🥣", "🍓", "🥞", "🍌", "🧇", "🍳"] },
    { icon: "☀️", label: "Déjeuner", dishes: ["🥗", "🍝", "🌯", "🍛", "🥙", "🍕", "🍲"] },
    { icon: "🌙", label: "Dîner", dishes: ["🍜", "🐟", "🥦", "🍲", "🌮", "🍔", "🥘"] },
  ]
}
