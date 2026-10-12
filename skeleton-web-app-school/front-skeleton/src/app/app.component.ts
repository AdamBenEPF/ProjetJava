import { Component, inject } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { AuthService } from "core/services/auth.service"
import { NavbarComponent } from "layout/navbar/navbar.component"

@Component({
  selector: "root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="app-container">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  constructor() {
    inject(AuthService).refreshSession()
  }
}
