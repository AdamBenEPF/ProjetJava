import { Component, inject } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { AuthService } from "core/services/auth.service"
import { IntroService } from "core/services/intro.service"
import { IntroVideoComponent } from "features/intro/intro-video/intro-video.component"
import { NavbarComponent } from "layout/navbar/navbar.component"

@Component({
  selector: "root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, IntroVideoComponent],
  template: `
    @if (intro.visible()) {
      <app-intro-video (closed)="intro.close()"></app-intro-video>
    }
    <app-navbar></app-navbar>
    <main class="app-container">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  readonly intro = inject(IntroService)

  constructor() {
    inject(AuthService).refreshSession()
  }
}
