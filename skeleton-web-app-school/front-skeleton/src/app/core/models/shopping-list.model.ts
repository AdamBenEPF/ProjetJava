/** Ligne agrégée de la liste de courses (somme des quantités d'un même ingrédient). */
export interface ShoppingListItem {
  ingredientId?: number
  nom: string
  unite: string
  quantite: number
}

/** Dernière liste enregistrée par le back (`shopping_lists`) + les lignes agrégées depuis le planning. */
export interface ListeCourses {
  id?: number
  utilisateurId: number
  /** Absente tant que l'utilisateur n'a jamais généré de liste. */
  dateGeneration?: string
  items: ShoppingListItem[]
}
