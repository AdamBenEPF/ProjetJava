import { inject } from "@angular/core"
import { CanActivateFn, Router } from "@angular/router"
import { AuthService } from "core/services/auth.service"

/** Pages réservées aux utilisateurs connectés : redirige vers la connexion en mémorisant la page demandée. */
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).isAuthenticated() ||
  inject(Router).createUrlTree(["/connexion"], { queryParams: { redirect: state.url } })

/** Pages de connexion / inscription : inutiles si l'utilisateur est déjà connecté. */
export const guestGuard: CanActivateFn = () =>
  !inject(AuthService).isAuthenticated() || inject(Router).createUrlTree(["/"])
