import { Injectable, computed, inject, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Router } from "@angular/router"
import { Observable, tap } from "rxjs"
import { environment } from "../../../environments/environment"
import { LoginRequest, RegisterRequest, Utilisateur } from "core/models/user.model"

const STORAGE_KEY = "repas.session"

/** Session de l'utilisateur connecté, conservée dans le navigateur entre deux visites. */
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly router = inject(Router)
  private readonly authUrl = `${environment.apiUrl}/auth`
  private readonly state = signal<Utilisateur | null>(this.load())

  readonly currentUser = this.state.asReadonly()
  readonly isAuthenticated = computed(() => this.state() !== null)

  /** POST /api/auth/login — renvoie l'utilisateur si les identifiants sont valides. */
  login(request: LoginRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.authUrl}/login`, request).pipe(tap((user) => this.setUser(user)))
  }

  /** POST /api/auth/register — crée le compte puis ouvre directement la session. */
  register(request: RegisterRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.authUrl}/register`, request).pipe(tap((user) => this.setUser(user)))
  }

  logout(): void {
    this.setUser(null)
    this.router.navigateByUrl("/connexion")
  }

  /** Met à jour l'utilisateur en session (ex. après modification du profil). */
  setUser(user: Utilisateur | null): void {
    this.state.set(user)
    this.save(user)
  }

  private load(): Utilisateur | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  private save(user: Utilisateur | null): void {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Stockage indisponible (navigation privée…) : la session reste en mémoire.
    }
  }
}
