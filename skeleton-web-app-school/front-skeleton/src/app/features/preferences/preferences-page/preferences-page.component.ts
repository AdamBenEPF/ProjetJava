import { Component, inject } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { Regime } from "core/models/enums.model"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { NotificationService } from "core/services/notification.service"
import { PageHeaderComponent } from "shared/components/page-header/page-header.component"
import { DietSelectorComponent } from "../diet-selector/diet-selector.component"

@Component({
  selector: "app-preferences-page",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    DietSelectorComponent,
  ],
  templateUrl: "./preferences-page.component.html",
  styleUrls: ["./preferences-page.component.scss"],
})
export class PreferencesPageComponent {
  private readonly preferencesService = inject(UserPreferencesService)
  private readonly notification = inject(NotificationService)
  private readonly current = this.preferencesService.preferences()

  readonly form = inject(FormBuilder).nonNullable.group({
    utilisateurId: [this.current.utilisateurId, [Validators.required, Validators.min(1)]],
    nom: [this.current.nom, Validators.maxLength(100)],
    preferenceRegime: [this.current.preferenceRegime as Regime | null],
  })

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const value = this.form.getRawValue()
    this.preferencesService.update({ ...value, nom: value.nom.trim() })
    this.form.markAsPristine()
    this.notification.success("Préférences enregistrées")
  }
}
