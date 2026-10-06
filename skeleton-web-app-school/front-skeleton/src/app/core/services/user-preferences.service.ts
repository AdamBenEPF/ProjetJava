import { Injectable, computed, effect, signal } from "@angular/core"
import { UserPreferences } from "core/models/user-preferences.model"

const STORAGE_KEY = "repas.preferences"

const DEFAULT_PREFERENCES: UserPreferences = {
  utilisateurId: 1,
  nom: "",
  preferenceRegime: null,
}

/** Utilisateur courant et son régime, conservés dans le navigateur (pas d'authentification prévue). */
@Injectable({ providedIn: "root" })
export class UserPreferencesService {
  private readonly state = signal<UserPreferences>(this.load())

  readonly preferences = this.state.asReadonly()
  readonly userId = computed(() => this.state().utilisateurId)
  readonly regime = computed(() => this.state().preferenceRegime)

  constructor() {
    effect(() => this.save(this.state()))
  }

  update(preferences: UserPreferences): void {
    this.state.set({ ...preferences })
  }

  private load(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES
    } catch {
      return DEFAULT_PREFERENCES
    }
  }

  private save(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // Stockage indisponible (navigation privée…) : les préférences restent en mémoire.
    }
  }
}
