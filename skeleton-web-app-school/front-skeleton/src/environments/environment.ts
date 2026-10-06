// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  /** Relatif : en dev, `proxy.conf.json` redirige `/api` vers le back Spring Boot (localhost:8080). */
  apiUrl: "/api",
  /** `true` = réponses simulées en mémoire (voir core/mocks), sans back. */
  useMockApi: false,
}
