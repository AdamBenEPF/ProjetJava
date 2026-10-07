import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms"

export const PASSWORD_MIN_LENGTH = 8

/** Vérifie que la confirmation est identique au champ `controlName` du même groupe. */
export function matchesControl(controlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const other = control.parent?.get(controlName)
    return other && control.value !== other.value ? { mismatch: true } : null
  }
}
