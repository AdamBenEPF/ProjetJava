import { Injectable, signal } from "@angular/core"

const STORAGE_KEY = "repas.intro-vue"

/**
 * Vidéo d'introduction affichée à l'arrivée sur le site.
 * Elle est jouée une fois par visite (session du navigateur) et peut être relancée depuis le menu.
 */
@Injectable({ providedIn: "root" })
export class IntroService {
  private readonly state = signal(!this.alreadySeen())

  readonly visible = this.state.asReadonly()

  play(): void {
    this.state.set(true)
  }

  close(): void {
    this.state.set(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // Stockage indisponible (navigation privée…) : l'intro sera simplement rejouée à la prochaine visite.
    }
  }

  private alreadySeen(): boolean {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1"
    } catch {
      return false
    }
  }
}
