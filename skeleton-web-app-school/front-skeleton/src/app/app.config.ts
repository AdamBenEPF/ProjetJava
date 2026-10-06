import { ApplicationConfig, LOCALE_ID } from "@angular/core"
import { registerLocaleData } from "@angular/common"
import localeFr from "@angular/common/locales/fr"
import { provideRouter, withComponentInputBinding } from "@angular/router"
import { provideHttpClient, withInterceptors } from "@angular/common/http"
import { provideAnimations } from "@angular/platform-browser/animations"
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar"
import { environment } from "../environments/environment"
import { routes } from "app.routes"
import { apiErrorInterceptor } from "core/interceptors/api-error.interceptor"
import { mockApiInterceptor } from "core/interceptors/mock-api.interceptor"

registerLocaleData(localeFr)

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiErrorInterceptor, ...(environment.useMockApi ? [mockApiInterceptor] : [])])),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: "fr-FR" },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { horizontalPosition: "center", verticalPosition: "bottom" } },
  ],
}
