/** Ligne agrégée de la liste de courses (somme des quantités d'un même ingrédient). */
export interface ShoppingListItem {
  ingredientId?: number
  nom: string
  unite: string
  quantite: number
}

/** Table `liste_courses` + ses lignes agrégées. */
export interface ListeCourses {
  id?: number
  utilisateurId: number
  dateGeneration?: string
  items: ShoppingListItem[]
}
