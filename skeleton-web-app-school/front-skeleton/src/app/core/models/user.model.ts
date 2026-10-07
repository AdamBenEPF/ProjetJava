import { Regime } from "./enums.model"

/** Utilisateur connecté (table `users`), sans le mot de passe. */
export interface Utilisateur {
  id: number
  nom: string
  email: string
  preferenceRegime: Regime | null
}

/** Corps de POST /api/auth/login. */
export interface LoginRequest {
  email: string
  motDePasse: string
}

/** Corps de POST /api/auth/register. */
export interface RegisterRequest extends LoginRequest {
  nom: string
  preferenceRegime: Regime | null
}
