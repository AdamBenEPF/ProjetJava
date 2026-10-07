import { Component, Input, signal } from "@angular/core"
import { FormControl, ReactiveFormsModule } from "@angular/forms"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"

/** Champ mot de passe avec bouton afficher / masquer et messages d'erreur usuels. */
@Component({
  selector: "app-password-field",
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline" class="full">
      <mat-label>{{ label }}</mat-label>
      <input matInput [type]="visible() ? 'text' : 'password'" [formControl]="control" [autocomplete]="autocomplete" />
      <button
        mat-icon-button
        matSuffix
        type="button"
        (click)="visible.set(!visible())"
        [attr.aria-label]="visible() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      >
        <mat-icon>{{ visible() ? "visibility_off" : "visibility" }}</mat-icon>
      </button>
      @if (hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @if (control.hasError("required")) {
        <mat-error>Ce champ est obligatoire.</mat-error>
      } @else if (control.hasError("minlength")) {
        <mat-error>Au moins {{ control.getError("minlength").requiredLength }} caractères.</mat-error>
      } @else if (control.hasError("mismatch")) {
        <mat-error>Les mots de passe ne correspondent pas.</mat-error>
      }
    </mat-form-field>
  `,
  styles: `
    .full {
      width: 100%;
    }
  `,
})
export class PasswordFieldComponent {
  @Input({ required: true }) control!: FormControl<string>
  @Input() label = "Mot de passe"
  @Input() autocomplete: "current-password" | "new-password" = "current-password"
  @Input() hint?: string

  readonly visible = signal(false)
}
