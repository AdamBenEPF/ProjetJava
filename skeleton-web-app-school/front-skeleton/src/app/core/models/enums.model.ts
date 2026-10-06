/** Valeurs de `utilisateur.preference_regime` et `recette.type_regime`. */
export type Regime = "VIANDE" | "VEGETARIEN" | "VEGAN"

/** Valeurs de `recette.type_repas` et `planning_repas.moment_repas`. */
export type TypeRepas = "PETIT_DEJEUNER" | "MIDI" | "SOIR"

export const REGIMES: Regime[] = ["VIANDE", "VEGETARIEN", "VEGAN"]

export const TYPES_REPAS: TypeRepas[] = ["PETIT_DEJEUNER", "MIDI", "SOIR"]

export const REGIME_LABELS: Record<Regime, string> = {
  VIANDE: "Viande",
  VEGETARIEN: "Végétarien",
  VEGAN: "Vegan",
}

export const TYPE_REPAS_LABELS: Record<TypeRepas, string> = {
  PETIT_DEJEUNER: "Petit-déjeuner",
  MIDI: "Déjeuner",
  SOIR: "Dîner",
}
