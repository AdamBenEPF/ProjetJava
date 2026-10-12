/**
 * Contrat JSON du back Spring Boot (noms anglais, valeurs libres comme "Vegetarian" ou "Lunch").
 * Les composants n'utilisent jamais ces types : les services les convertissent via `api.mappers.ts`.
 */

/** Entité `Recipe`, renvoyée seule par POST /api/ai/personalized (sans ses ingrédients). */
export interface RecipeEntityDto {
  id: number
  title: string
  mealType: string
  dietType: string
  calories: number | null
  proteins: number | null
  carbs: number | null
  fats: number | null
}

/** Réponse de GET/POST /api/recipes (`RecipeDetailsDTO`) : la recette et ses ingrédients. */
export interface RecipeDto extends RecipeEntityDto {
  ingredients: RecipeIngredientDto[]
}

/** Ligne d'ingrédient de `RecipeDetailsDTO` et de GET /api/recipes/{id}/ingredients (`RecipeIngredientResponse`). */
export interface RecipeIngredientDto {
  ingredientId: number
  name: string
  unit: string | null
  quantity: number
}

/** Corps de POST /api/recipes (`RecipeCreationDTO`) : les ingrédients sont référencés par identifiant. */
export interface RecipeCreationDto {
  title: string
  mealType: string
  dietType: string
  calories: number | null
  proteins: number | null
  carbs: number | null
  fats: number | null
  ingredients: { ingredientId: number; quantity: number }[]
}

/** Corps de POST /api/ai/personalized (`PersonalizedMealRequest`) : tous les critères sont optionnels. */
export interface PersonalizedMealRequestDto {
  dietType: string | null
  mealType: string | null
  targetCalories: number | null
  targetProteins: number | null
  mandatoryIngredient: string | null
  preferences: string | null
}

/** Entité `Ingredient` de GET/POST /api/ingredients. */
export interface IngredientDto {
  id: number
  name: string
  unit: string | null
}

/** Réponse de /api/auth/*, GET et PUT /api/users/{id} (seuls ces champs sont lus, jamais le mot de passe). */
export interface UserDto {
  id: number
  name: string
  email: string
  dietPreference: string | null
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto extends LoginDto {
  name: string
  dietPreference: string | null
}

export interface UserUpdateDto {
  name: string
  dietPreference: string | null
}

/** Entité `MealPlan` de GET /api/meal-plans/user/{userId} et POST /api/meal-plans (la recette n'est référencée que par son id). */
export interface MealPlanDto {
  id: number
  userId: number
  recipeId: number
  /** Format ISO `YYYY-MM-DD`. */
  date: string
  momentRepas: string
}

/** Entité `ShoppingList` de /api/shopping-lists : le back n'enregistre que la date de génération, pas les articles. */
export interface ShoppingListDto {
  id: number
  userId: number
  /** `LocalDateTime` sans fuseau, ex. `2026-10-12T10:15:00.123`. */
  dateGeneration: string | null
}
