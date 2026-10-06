import { Component, inject } from "@angular/core"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"
import { Link } from "core/models/link.model"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { DietBadgeComponent } from "shared/components/diet-badge/diet-badge.component"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    DietBadgeComponent,
  ],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  readonly preferences = inject(UserPreferencesService).preferences

  readonly links: Link[] = [
    { name: "Recettes", href: "/recettes", icon: "menu_book" },
    { name: "Planning", href: "/planning", icon: "calendar_month" },
    { name: "Courses", href: "/courses", icon: "shopping_cart" },
    { name: "Préférences", href: "/preferences", icon: "tune" },
  ]
}
