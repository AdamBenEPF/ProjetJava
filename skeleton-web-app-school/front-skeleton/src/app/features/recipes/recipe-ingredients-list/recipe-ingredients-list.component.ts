import { Component, Input } from "@angular/core"
import { DecimalPipe } from "@angular/common"
import { RecetteIngredient } from "core/models/recipe.model"

@Component({
  selector: "app-recipe-ingredients-list",
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (ingredients.length) {
    <ul class="ingredients">
      @for (line of ingredients; track $index) {
      <li>
        <span>{{ line.ingredient.nom }}</span>
        <span class="quantity">{{ line.quantite | number : "1.0-2" }} {{ line.ingredient.unite }}</span>
      </li>
      }
    </ul>
    } @else {
    <p class="none">Aucun ingrédient renseigné.</p>
    }
  `,
  styles: `
    .ingredients {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--app-border);
    }
    .quantity {
      font-weight: 500;
      color: var(--app-text-muted);
    }
    .none {
      color: var(--app-text-muted);
    }
  `,
})
export class RecipeIngredientsListComponent {
  @Input() ingredients: RecetteIngredient[] = []
}
