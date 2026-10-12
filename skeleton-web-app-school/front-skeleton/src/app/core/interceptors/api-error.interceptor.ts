import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http"
import { catchError, throwError } from "rxjs"

/** Erreur renvoyée aux composants : message prêt à afficher + code HTTP d'origine. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

const MESSAGES_BY_STATUS: Record<number, string> = {
  0: "Impossible de joindre le serveur. Vérifiez que le back est démarré.",
  400: "Requête invalide : vérifiez les informations saisies.",
  401: "Email ou mot de passe incorrect.",
  404: "Ressource introuvable.",
  409: "Un compte existe déjà avec cet email.",
  500: "Erreur interne du serveur. Réessayez plus tard.",
  502: "Le service d'IA a renvoyé une réponse invalide. Réessayez.",
  503: "La génération par l'IA est indisponible (clé GROQ_API_KEY non configurée côté back).",
}

/** Traduit les codes HTTP standards du contrat d'API en messages compréhensibles. */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error)
      // Spring Boot renvoie `{ message: "" }` quand aucun message n'est fourni : on retombe alors sur un message générique.
      const serverMessage = typeof error.error?.message === "string" ? error.error.message.trim() : ""
      const message = serverMessage || MESSAGES_BY_STATUS[error.status] || `Erreur inattendue (${error.status}).`
      return throwError(() => new ApiError(message, error.status))
    }),
  )

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Une erreur inattendue est survenue."
}
