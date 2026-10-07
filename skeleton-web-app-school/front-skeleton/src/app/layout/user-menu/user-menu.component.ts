import { Component, inject } from "@angular/core"
import { RouterLink } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"
import { MatDividerModule } from "@angular/material/divider"
import { AuthService } from "core/services/auth.service"
import { NotificationService } from "core/services/notification.service"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"

/** Zone utilisateur de la barre de navigation : profil + déconnexion, ou liens de connexion / inscription. */
@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, DietBadgeComponent],
  templateUrl: "./user-menu.component.html",
  styleUrls: ["./user-menu.component.scss"],
})
export class UserMenuComponent {
  private readonly auth = inject(AuthService)
  private readonly notification = inject(NotificationService)

  readonly user = this.auth.currentUser

  logout(): void {
    this.auth.logout()
    this.notification.success("Vous êtes déconnecté.")
  }
}
