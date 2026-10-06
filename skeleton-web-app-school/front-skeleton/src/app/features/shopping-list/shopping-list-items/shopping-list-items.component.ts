import { Component, EventEmitter, Input, Output } from "@angular/core"
import { MatCardModule } from "@angular/material/card"
import { ShoppingListItem } from "core/models/shopping-list.model"
import { ShoppingListItemComponent } from "../shopping-list-item/shopping-list-item.component"
import { itemKey } from "../shopping-list.utils"

/** Liste des articles : ceux restant à acheter d'abord, puis ceux déjà cochés. */
@Component({
  selector: "app-shopping-list-items",
  standalone: true,
  imports: [MatCardModule, ShoppingListItemComponent],
  template: `
    <mat-card>
      <mat-card-content>
        @for (item of toBuy; track key(item)) {
        <app-shopping-list-item [item]="item" (toggle)="toggle.emit(key(item))"></app-shopping-list-item>
        } @if (bought.length) {
        <h3 class="no-print">Déjà dans le panier</h3>
        @for (item of bought; track key(item)) {
        <app-shopping-list-item
          class="no-print"
          [item]="item"
          [checked]="true"
          (toggle)="toggle.emit(key(item))"
        ></app-shopping-list-item>
        } }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    h3 {
      margin: 20px 0 4px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--app-text-muted);
    }
  `,
})
export class ShoppingListItemsComponent {
  @Input({ required: true }) items!: ShoppingListItem[]
  @Input() checkedKeys = new Set<string>()
  @Output() toggle = new EventEmitter<string>()

  readonly key = itemKey

  get toBuy(): ShoppingListItem[] {
    return this.items.filter((item) => !this.checkedKeys.has(itemKey(item)))
  }

  get bought(): ShoppingListItem[] {
    return this.items.filter((item) => this.checkedKeys.has(itemKey(item)))
  }
}
