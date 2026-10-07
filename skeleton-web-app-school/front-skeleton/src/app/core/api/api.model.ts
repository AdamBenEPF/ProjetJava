/**
 * Contrat JSON du back Spring Boot (noms anglais, valeurs libres comme "Vegetarian" ou "Lunch").
 * Les composants n'utilisent jamais ces types : les services les convertissent via `api.mappers.ts`.
 */

/** Réponse de GET/POST /api/recipes et de GET /api/ai/suggest (`RecipeDetailsDTO`, sans id pour une proposition IA). */
export interface RecipeDto {
  id: number | null
  title: string
  mealType: string
  dietType: string
  calories: number | null
  proteins: number | null
  carbs: number | null
  fats: number | null
  ingredients: RecipeIngredientDto[]
}

export interface RecipeIngredientDto {
  /** `null` pour un ingrédient proposé par l'IA, pas encore enregistré. */
  ingredientId: number | null
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

/** Entité `Ingredient` de GET/POST /api/ingredients. */
export interface IngredientDto {
  id: number
  name: string
  unit: string | null
}

/** Réponse de /api/auth/* et PUT /api/users/{id} (`UserDTO`, sans mot de passe). */
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
