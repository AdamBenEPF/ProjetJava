import { Component, inject, signal } from "@angular/core"
import { Router, RouterLink } from "@angular/router"
import { RegisterRequest } from "core/models/user.model"
import { AuthService } from "core/services/auth.service"
import { NotificationService } from "core/services/notification.service"
import { errorMessage } from "core/interceptors/api-error.interceptor"
import { AuthCardComponent } from "../auth-card/auth-card.component"
import { RegisterFormComponent } from "../register-form/register-form.component"

@Component({
  selector: "app-register-page",
  standalone: true,
  imports: [RouterLink, AuthCardComponent, RegisterFormComponent],
  template: `
    <app-auth-card title="Inscription" subtitle="Créez votre profil pour planifier vos repas." icon="person_add">
      <app-register-form [loading]="loading()" [error]="error()" (submitted)="register($event)"></app-register-form>
      <span footer>Déjà inscrit ? <a routerLink="/connexion">Se connecter</a></span>
    </app-auth-card>
  `,
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)
  private readonly notification = inject(NotificationService)

  readonly loading = signal(false)
  readonly error = signal<string | null>(null)

  register(request: RegisterRequest): void {
    this.loading.set(true)
    this.error.set(null)
    this.auth.register(request).subscribe({
      next: (user) => {
        this.notification.success(`Compte créé, bienvenue ${user.nom} !`)
        this.router.navigateByUrl("/")
      },
      error: (err) => {
        this.error.set(errorMessage(err))
        this.loading.set(false)
      },
    })
  }
}
