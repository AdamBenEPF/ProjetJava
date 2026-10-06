import { FormControl, FormGroup } from "@angular/forms"

export type IngredientFormGroup = FormGroup<{
  nom: FormControl<string>
  unite: FormControl<string>
  quantite: FormControl<number | null>
}>

export const UNITES = ["grammes", "millilitres", "pieces", "cuilleres a soupe", "cuilleres a cafe"]
