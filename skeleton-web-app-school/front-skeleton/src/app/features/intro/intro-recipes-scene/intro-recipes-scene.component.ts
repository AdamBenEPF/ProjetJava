import { Component } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"
import { Regime } from "core/models/enums.model"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"

/** Chapitre « Recettes » de la vidéo d'introduction : catalogue filtré par régime puis recette générée par l'IA. */
@Component({
  selector: "app-intro-recipes-scene",
  standalone: true,
  imports: [MatIconModule, DietBadgeComponent],
  template: `
    <div class="cards">
      @for (recipe of recipes; track recipe.nom; let i = $index) {
        <article class="card" [style.--i]="i">
          <span class="emoji" aria-hidden="true">{{ recipe.emoji }}</span>
          <strong>{{ recipe.nom }}</strong>
          <span class="meta">{{ recipe.kcal }} kcal</span>
          <app-diet-badge [regime]="recipe.regime"></app-diet-badge>
        </article>
      }
      <article class="card ai">
        <span class="ai-chip"><mat-icon>auto_awesome</mat-icon>Générée par l'IA</span>
        <strong>Bowl quinoa &amp; avocat</strong>
        @for (macro of macros; track macro.label; let i = $index) {
          <div class="macro" [style.--i]="i">
            <span>{{ macro.label }}</span>
            <span>{{ macro.grammes }} g</span>
            <span class="bar"><span [style.width.%]="macro.part" [style.background]="macro.color"></span></span>
          </div>
        }
      </article>
    </div>
  `,
  styles: `
    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      text-align: left;
    }
    .card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 16px;
      border-radius: 16px;
      background: var(--app-surface);
      color: var(--app-text);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      animation: card-in 0.6s calc(0.5s + var(--i) * 0.25s) cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }
    .emoji {
      font-size: 2.4rem;
    }
    .meta {
      font-size: 0.85rem;
      color: var(--app-text-muted);
    }
    .ai {
      --i: 4;
      outline: 3px solid var(--app-accent);
    }
    .ai-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--app-accent);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .ai-chip mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      animation: sparkle 1.2s 1.6s ease-in-out 3;
    }
    .macro {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 2px 8px;
      width: 100%;
      font-size: 0.8rem;
    }
    .bar {
      grid-column: 1 / -1;
      height: 6px;
      border-radius: 3px;
      background: var(--app-surface-alt);
    }
    .bar span {
      display: block;
      height: 100%;
      border-radius: inherit;
      animation: grow 0.8s calc(2.6s + var(--i) * 0.25s) ease-out both;
    }
    @keyframes card-in {
      from {
        opacity: 0;
        transform: translateY(40px) rotate(-3deg);
      }
    }
    @keyframes sparkle {
      50% {
        transform: scale(1.4) rotate(20deg);
      }
    }
    @keyframes grow {
      from {
        width: 0;
      }
    }
    @media (max-width: 800px) {
      .cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
})
export class IntroRecipesSceneComponent {
  readonly recipes: { emoji: string; nom: string; kcal: number; regime: Regime }[] = [
    { emoji: "🥗", nom: "Salade César", kcal: 420, regime: "VIANDE" },
    { emoji: "🍝", nom: "Pâtes au pesto", kcal: 560, regime: "VEGETARIEN" },
    { emoji: "🍛", nom: "Curry de pois chiches", kcal: 480, regime: "VEGAN" },
  ]

  readonly macros = [
    { label: "Protéines", grammes: 18, part: 45, color: "var(--app-primary)" },
    { label: "Glucides", grammes: 52, part: 80, color: "var(--app-accent)" },
    { label: "Lipides", grammes: 14, part: 35, color: "#f9a825" },
  ]
}
