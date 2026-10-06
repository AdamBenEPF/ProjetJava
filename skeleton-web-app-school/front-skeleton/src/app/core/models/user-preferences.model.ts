import { Regime } from "./enums.model"

/** Sous-ensemble de la table `utilisateur` utilisé par le front. */
export interface UserPreferences {
  utilisateurId: number
  nom: string
  preferenceRegime: Regime | null
}
