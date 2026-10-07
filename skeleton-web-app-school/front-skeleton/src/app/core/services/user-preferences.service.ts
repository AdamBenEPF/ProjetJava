import { Injectable, computed, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, tap } from "rxjs"
import { environment } from "../../../environments/environment"
import { UserPreferences } from "core/models/user-preferences.model"
import { Utilisateur } from "core/models/user.model"
import { AuthService } from "./auth.service"

/**
 * Profil et régime de l'utilisateur connecté.
 * Les pages qui l'utilisent sont protégées par `authGuard` : un utilisateur est donc toujours en session.
 */
@Injectable({ providedIn: "root" })
export class UserPreferencesService {
  private readonly http = inject(HttpClient)
  private readonly auth = inject(AuthService)
  private readonly usersUrl = `${environment.apiUrl}/users`

  readonly preferences = computed<UserPreferences>(() => ({
    nom: this.auth.currentUser()?.nom ?? "",
    preferenceRegime: this.auth.currentUser()?.preferenceRegime ?? null,
  }))
  readonly userId = computed(() => this.auth.currentUser()?.id ?? 0)
  readonly regime = computed(() => this.preferences().preferenceRegime)

  /** PUT /api/users/{id} — enregistre le nom et le régime, puis rafraîchit la session. */
  update(preferences: UserPreferences): Observable<Utilisateur> {
    return this.http
      .put<Utilisateur>(`${this.usersUrl}/${this.userId()}`, preferences)
      .pipe(tap((user) => this.auth.setUser(user)))
  }
}
