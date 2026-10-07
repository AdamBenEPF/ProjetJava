import { Component, EventEmitter, Input, Output, inject } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { LoginRequest } from "core/models/user.model"
import { ErrorStateComponent } from "shared/components/error-state/error-state.component"
import { PasswordFieldComponent } from "../password-field/password-field.component"

/** Formulaire de connexion : valide la saisie et émet les identifiants, sans appel réseau. */
@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ErrorStateComponent,
    PasswordFieldComponent,
  ],
  templateUrl: "./login-form.component.html",
  styleUrls: ["../auth-form.scss"],
})
export class LoginFormComponent {
  @Input() loading = false
  @Input() error: string | null = null
  @Output() submitted = new EventEmitter<LoginRequest>()

  readonly form = inject(FormBuilder).nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    motDePasse: ["", Validators.required],
  })

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const { email, motDePasse } = this.form.getRawValue()
    this.submitted.emit({ email: email.trim(), motDePasse })
  }
}
