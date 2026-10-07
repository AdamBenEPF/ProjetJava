import { Component, Input, inject, signal } from "@angular/core"
import { Router, RouterLink } from "@angular/router"
import { LoginRequest } from "core/models/user.model"
import { AuthService } from "core/services/auth.service"
import { NotificationService } from "core/services/notification.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { AuthCardComponent } from "../auth-card/auth-card.component"
import { LoginFormComponent } from "../login-form/login-form.component"

@Component({
  selector: "app-login-page",
  standalone: true,
  imports: [RouterLink, AuthCardComponent, LoginFormComponent],
  template: `
    <app-auth-card title="Connexion" subtitle="Retrouvez votre planning et vos listes de courses." icon="login">
      <app-login-form [loading]="loading()" [error]="error()" (submitted)="login($event)"></app-login-form>
      <span footer>Pas encore de compte ? <a routerLink="/inscription">Créer un compte</a></span>
    </app-auth-card>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)
  private readonly notification = inject(NotificationService)

  /** Page demandée avant la redirection par `authGuard` (paramètre `?redirect=`). */
  @Input() redirect?: string

  readonly loading = signal(false)
  readonly error = signal<string | null>(null)

  login(request: LoginRequest): void {
    this.loading.set(true)
    this.error.set(null)
    this.auth.login(request).subscribe({
      next: (user) => {
        this.notification.success(`Bienvenue ${user.nom} !`)
        this.router.navigateByUrl(this.redirect?.startsWith("/") ? this.redirect : "/")
      },
      error: (err) => {
        this.error.set(errorMessage(err))
        this.loading.set(false)
      },
    })
  }
}
