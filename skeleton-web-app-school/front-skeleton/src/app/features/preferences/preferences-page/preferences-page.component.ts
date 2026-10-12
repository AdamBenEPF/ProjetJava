import { Component, inject, signal } from "@angular/core"
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatDialog } from "@angular/material/dialog"
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
import { ConfirmDialogComponent, ConfirmDialogData } from "shared/components/confirm-dialog/confirm-dialog.component"
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
  private readonly auth = inject(AuthService)
  private readonly dialog = inject(MatDialog)
  private readonly current = this.preferencesService.preferences()

  readonly user = this.auth.currentUser
  readonly saving = signal(false)
  readonly deleting = signal(false)

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

  deleteAccount(): void {
    const data: ConfirmDialogData = {
      title: "Supprimer mon compte ?",
      message: "Cette action est irréversible : votre profil, votre planning et vos listes de courses seront effacés.",
      confirmLabel: "Supprimer définitivement",
      danger: true,
    }
    this.dialog
      .open(ConfirmDialogComponent, { data, width: "440px", maxWidth: "95vw" })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) return
        this.deleting.set(true)
        this.auth.deleteAccount().subscribe({
          next: () => this.notification.success("Votre compte a été supprimé."),
          error: (err) => {
            this.deleting.set(false)
            this.notification.error(errorMessage(err))
          },
        })
      })
  }
}
