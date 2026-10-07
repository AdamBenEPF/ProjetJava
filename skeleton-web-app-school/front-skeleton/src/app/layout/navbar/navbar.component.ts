import { Component, inject } from "@angular/core"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"
import { Link } from "core/models/link.model"
import { AuthService } from "core/services/auth.service"
import { UserMenuComponent } from "../user-menu/user-menu.component"

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
    UserMenuComponent,
  ],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  readonly isAuthenticated = inject(AuthService).isAuthenticated

  readonly links: Link[] = [
    { name: "Recettes", href: "/recettes", icon: "menu_book" },
    { name: "Planning", href: "/planning", icon: "calendar_month" },
    { name: "Courses", href: "/courses", icon: "shopping_cart" },
    { name: "Préférences", href: "/preferences", icon: "tune" },
  ]
}
