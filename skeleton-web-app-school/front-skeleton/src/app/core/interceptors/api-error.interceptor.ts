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
  404: "Ressource introuvable.",
  500: "Erreur interne du serveur. Réessayez plus tard.",
}

/** Traduit les codes HTTP standards du contrat d'API en messages compréhensibles. */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error)
      const serverMessage = typeof error.error?.message === "string" ? error.error.message : null
      const message = serverMessage ?? MESSAGES_BY_STATUS[error.status] ?? `Erreur inattendue (${error.status}).`
      return throwError(() => new ApiError(message, error.status))
    }),
  )

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Une erreur inattendue est survenue."
}
