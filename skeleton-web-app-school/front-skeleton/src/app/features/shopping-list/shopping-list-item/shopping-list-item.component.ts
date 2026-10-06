import { Component, EventEmitter, Input, Output } from "@angular/core"
import { DecimalPipe } from "@angular/common"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { ShoppingListItem } from "core/models/shopping-list.model"

@Component({
  selector: "app-shopping-list-item",
  standalone: true,
  imports: [DecimalPipe, MatCheckboxModule],
  template: `
    <label class="item" [class.checked]="checked">
      <mat-checkbox color="primary" [checked]="checked" (change)="toggle.emit()"></mat-checkbox>
      <span class="name">{{ item.nom }}</span>
      <span class="quantity">{{ item.quantite | number : "1.0-2" }} {{ item.unite }}</span>
    </label>
  `,
  styles: `
    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 4px;
      border-bottom: 1px solid var(--app-border);
      cursor: pointer;
    }
    .name {
      flex: 1;
    }
    .quantity {
      font-weight: 600;
      white-space: nowrap;
    }
    .checked .name,
    .checked .quantity {
      text-decoration: line-through;
      color: var(--app-text-muted);
    }
  `,
})
export class ShoppingListItemComponent {
  @Input({ required: true }) item!: ShoppingListItem
  @Input() checked = false
  @Output() toggle = new EventEmitter<void>()
}
