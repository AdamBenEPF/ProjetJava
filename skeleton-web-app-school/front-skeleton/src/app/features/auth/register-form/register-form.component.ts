import { Component, EventEmitter, Input, Output, inject } from "@angular/core"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { Regime } from "core/models/enums.model"
import { RegisterRequest } from "core/models/user.model"
import { DietSelectorComponent } from "shared/components/diet-selector/diet-selector.component"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { PasswordFieldComponent } from "../password-field/password-field.component"
import { PASSWORD_MIN_LENGTH, matchesControl } from "../auth.validators"

/** Formulaire d'inscription : profil, mot de passe confirmé et régime ; émet la demande de création. */
@Component({
  selector: "app-register-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DietSelectorComponent,
    ErrorStateComponent,
    PasswordFieldComponent,
  ],
  templateUrl: "./register-form.component.html",
  styleUrls: ["../auth-form.scss"],
})
export class RegisterFormComponent {
  @Input() loading = false
  @Input() error: string | null = null
  @Output() submitted = new EventEmitter<RegisterRequest>()

  readonly passwordHint = `${PASSWORD_MIN_LENGTH} caractères minimum.`

  readonly form = inject(FormBuilder).nonNullable.group({
    nom: ["", [Validators.required, Validators.maxLength(100)]],
    email: ["", [Validators.required, Validators.email]],
    motDePasse: ["", [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
    confirmation: ["", [Validators.required, matchesControl("motDePasse")]],
    preferenceRegime: [null as Regime | null],
  })

  constructor() {
    // La confirmation doit être revalidée quand le mot de passe change après coup.
    this.form.controls.motDePasse.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmation.updateValueAndValidity())
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const { nom, email, motDePasse, preferenceRegime } = this.form.getRawValue()
    this.submitted.emit({ nom: nom.trim(), email: email.trim(), motDePasse, preferenceRegime })
  }
}
