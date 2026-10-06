import { ShoppingListItem } from "core/models/shopping-list.model"

/** Un même ingrédient peut apparaître dans plusieurs unités : la clé combine les deux. */
export function itemKey(item: ShoppingListItem): string {
  return `${item.nom}|${item.unite}`
}
