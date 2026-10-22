import { Component } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"

/** Chapitre « Courses » de la vidéo d'introduction : les ingrédients de la semaine sont listés puis cochés. */
@Component({
  selector: "app-intro-shopping-scene",
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="list" role="img" aria-label="Liste de courses dont les articles sont cochés un à un">
      <div class="head">
        <strong><mat-icon>shopping_cart</mat-icon> Ma liste de la semaine</strong>
        <span class="export"><mat-icon>download</mat-icon> PDF</span>
      </div>
      <span class="progress"><span></span></span>
      @for (item of items; track item.nom; let i = $index) {
        <div class="item" [style.--i]="i">
          <span class="check"></span>
          <span aria-hidden="true">{{ item.emoji }}</span>
          <span class="name">{{ item.nom }}</span>
          <span class="qty">{{ item.quantite }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .list {
      width: min(460px, 100%);
      margin: 0 auto;
      padding: 20px;
      border-radius: 20px;
      background: var(--app-surface);
      color: var(--app-text);
      text-align: left;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .head strong,
    .export {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .head mat-icon {
      color: var(--app-primary);
    }
    .export {
      padding: 4px 12px;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--app-accent);
      font-size: 0.85rem;
      font-weight: 600;
      animation: appear 0.4s 3.8s both;
    }
    .export mat-icon {
      color: inherit;
    }
    .progress {
      display: block;
      height: 6px;
      margin: 14px 0 6px;
      border-radius: 3px;
      background: var(--app-surface-alt);
    }
    .progress span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--app-primary);
      animation: grow 2.1s 1.5s steps(6) both;
    }
    .item {
      --d: calc(1.5s + var(--i) * 0.35s);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid var(--app-border);
      animation: slide 0.4s calc(0.3s + var(--i) * 0.12s) ease-out both;
    }
    .check {
      flex: none;
      width: 20px;
      height: 20px;
      border: 2px solid var(--app-border);
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      line-height: 16px;
      text-align: center;
      animation: tick 0.25s var(--d) both;
    }
    .check::after {
      content: "✓";
    }
    .name {
      position: relative;
      flex: 1;
      animation: done 0.25s var(--d) both;
    }
    .name::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      height: 2px;
      background: currentColor;
      animation: grow 0.3s var(--d) both;
    }
    .qty {
      color: var(--app-text-muted);
      font-size: 0.85rem;
    }
    @keyframes slide {
      from {
        opacity: 0;
        transform: translateX(-24px);
      }
    }
    @keyframes tick {
      from {
        color: transparent;
      }
      to {
        border-color: var(--app-primary);
        background: var(--app-primary);
      }
    }
    @keyframes done {
      to {
        color: var(--app-text-muted);
      }
    }
    @keyframes grow {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }
    @keyframes appear {
      from {
        opacity: 0;
        transform: scale(0.6);
      }
    }
  `,
})
export class IntroShoppingSceneComponent {
  readonly items = [
    { emoji: "🥑", nom: "Avocats", quantite: "3" },
    { emoji: "🍅", nom: "Tomates", quantite: "500 g" },
    { emoji: "🥬", nom: "Salade", quantite: "1" },
    { emoji: "🧀", nom: "Parmesan", quantite: "100 g" },
    { emoji: "🍝", nom: "Pâtes", quantite: "500 g" },
    { emoji: "🥛", nom: "Lait d'avoine", quantite: "1 L" },
  ]
}
