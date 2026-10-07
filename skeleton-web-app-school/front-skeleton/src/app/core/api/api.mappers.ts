import { Regime, TypeRepas } from "core/models/enums.model"
import { Recette } from "core/models/recipe.model"
import { LoginRequest, RegisterRequest, Utilisateur } from "core/models/user.model"
import { UserPreferences } from "core/models/user-preferences.model"
import { LoginDto, RecipeCreationDto, RecipeDto, RegisterDto, UserDto, UserUpdateDto } from "./api.model"

/** Valeurs stockées en base par le back (voir V2__insert_default_data.sql). */
const API_REGIMES: Record<Regime, string> = {
  VIANDE: "Omnivore",
  VEGETARIEN: "Vegetarian",
  VEGAN: "Vegan",
}

const API_TYPES_REPAS: Record<TypeRepas, string> = {
  PETIT_DEJEUNER: "Breakfast",
  MIDI: "Lunch",
  SOIR: "Dinner",
}

export const toApiRegime = (regime: Regime | null): string | null => (regime ? API_REGIMES[regime] : null)

export const toApiTypeRepas = (typeRepas: TypeRepas): string => API_TYPES_REPAS[typeRepas]

export const fromApiRegime = (value: string | null): Regime | null => fromApiValue(API_REGIMES, value)

export const fromApiTypeRepas = (value: string | null): TypeRepas | null => fromApiValue(API_TYPES_REPAS, value)

export function toRecette(dto: RecipeDto): Recette {
  return {
    id: dto.id,
    titre: dto.title,
    typeRepas: fromApiTypeRepas(dto.mealType) ?? "MIDI",
    typeRegime: fromApiRegime(dto.dietType) ?? "VIANDE",
    calories: dto.calories,
    proteines: dto.proteins,
    glucides: dto.carbs,
    lipides: dto.fats,
    ingredients: dto.ingredients.map((line) => ({
      ingredient: { id: line.ingredientId, nom: line.name, unite: line.unit ?? "" },
      quantite: Number(line.quantity),
    })),
  }
}

/** Opération inverse de `toRecette` (utilisée par le mock pour répondre comme le back). */
export function toRecipeDto(recette: Recette & { id: number }): RecipeDto {
  return {
    id: recette.id,
    title: recette.titre,
    mealType: toApiTypeRepas(recette.typeRepas),
    dietType: API_REGIMES[recette.typeRegime],
    calories: recette.calories ?? null,
    proteins: recette.proteines ?? null,
    carbs: recette.glucides ?? null,
    fats: recette.lipides ?? null,
    ingredients: (recette.ingredients ?? []).map(({ ingredient, quantite }) => ({
      ingredientId: ingredient.id ?? 0,
      name: ingredient.nom,
      unit: ingredient.unite,
      quantity: quantite,
    })),
  }
}

/**
 * `ingredientIds[i]` est l'identifiant en base de `recette.ingredients[i]`.
 * Un même ingrédient saisi deux fois est fusionné (clé primaire recipe_id + ingredient_id).
 */
export function toRecipeCreationDto(recette: Recette, ingredientIds: number[]): RecipeCreationDto {
  const quantities = new Map<number, number>()
  ;(recette.ingredients ?? []).forEach(({ quantite }, index) => {
    const id = ingredientIds[index]
    quantities.set(id, (quantities.get(id) ?? 0) + quantite)
  })
  return {
    title: recette.titre,
    mealType: toApiTypeRepas(recette.typeRepas),
    dietType: API_REGIMES[recette.typeRegime],
    calories: recette.calories != null ? Math.round(recette.calories) : null,
    proteins: recette.proteines ?? null,
    carbs: recette.glucides ?? null,
    fats: recette.lipides ?? null,
    ingredients: [...quantities].map(([ingredientId, quantity]) => ({ ingredientId, quantity })),
  }
}

export function toUtilisateur(dto: UserDto): Utilisateur {
  return { id: dto.id, nom: dto.name, email: dto.email, preferenceRegime: fromApiRegime(dto.dietPreference) }
}

export function toLoginDto(request: LoginRequest): LoginDto {
  return { email: request.email, password: request.motDePasse }
}

export function toRegisterDto(request: RegisterRequest): RegisterDto {
  return { ...toLoginDto(request), name: request.nom, dietPreference: toApiRegime(request.preferenceRegime) }
}

export function toUserUpdateDto(preferences: UserPreferences): UserUpdateDto {
  return { name: preferences.nom, dietPreference: toApiRegime(preferences.preferenceRegime) }
}

/** Recherche insensible à la casse : "vegetarian" ou "VEGETARIEN" donnent tous deux VEGETARIEN. */
function fromApiValue<K extends string>(values: Record<K, string>, value: string | null): K | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  const keys = Object.keys(values) as K[]
  return keys.find((key) => values[key].toLowerCase() === normalized || key.toLowerCase() === normalized) ?? null
}
