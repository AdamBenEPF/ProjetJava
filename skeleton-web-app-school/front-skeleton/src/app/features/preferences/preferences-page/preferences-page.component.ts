import { Component, inject, signal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { Regime } from "core/models/enums.model"
import { AuthService } from "core/services/auth.service"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { NotificationService } from "core/services/notification.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { PageHeaderComponent } from "shared/components/page-header/page-header.component"
import { DietSelectorComponent } from "shared/components/diet-selector/diet-selector.component"
import { ProfileSectionComponent } from "../profile-section/profile-section.component"

@Component({
  selector: "app-preferences-page",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    DietSelectorComponent,
    ProfileSectionComponent,
  ],
  templateUrl: "./preferences-page.component.html",
  styleUrls: ["./preferences-page.component.scss"],
})
export class PreferencesPageComponent {
  private readonly preferencesService = inject(UserPreferencesService)
  private readonly notification = inject(NotificationService)
  private readonly current = this.preferencesService.preferences()

  readonly user = inject(AuthService).currentUser
  readonly saving = signal(false)

  readonly form = inject(FormBuilder).nonNullable.group({
    nom: [this.current.nom, [Validators.required, Validators.maxLength(100)]],
    preferenceRegime: [this.current.preferenceRegime as Regime | null],
  })

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const value = this.form.getRawValue()
    this.saving.set(true)
    this.preferencesService.update({ ...value, nom: value.nom.trim() }).subscribe({
      next: () => {
        this.form.markAsPristine()
        this.saving.set(false)
        this.notification.success("Préférences enregistrées")
      },
      error: (err) => {
        this.saving.set(false)
        this.notification.error(errorMessage(err))
      },
    })
  }
}
