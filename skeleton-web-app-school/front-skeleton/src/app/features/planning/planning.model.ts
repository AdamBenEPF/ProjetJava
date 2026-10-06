import { TypeRepas } from "core/models/enums.model"

/** Créneau du calendrier sélectionné par l'utilisateur. */
export interface MealSlot {
  date: string
  moment: TypeRepas
}
