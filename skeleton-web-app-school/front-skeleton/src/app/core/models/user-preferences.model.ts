import { Utilisateur } from "./user.model"

/** Champs du profil modifiables depuis la page Préférences (corps de PUT /api/users/{id}). */
export type UserPreferences = Pick<Utilisateur, "nom" | "preferenceRegime">
