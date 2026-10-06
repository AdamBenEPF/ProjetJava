import { Component, Input, LOCALE_ID, inject } from "@angular/core"
import { formatNumber } from "@angular/common"

export interface NutritionValues {
  calories?: number | null
  proteines?: number | null
  glucides?: number | null
  lipides?: number | null
}

/** Valeurs nutritionnelles d'une recette (ou d'un total), en version complète ou compacte. */
@Component({
  selector: "app-nutrition-summary",
  standalone: true,
  templateUrl: "./nutrition-summary.component.html",
  styleUrls: ["./nutrition-summary.component.scss"],
})
export class NutritionSummaryComponent {
  @Input({ required: true }) values!: NutritionValues
  @Input() compact = false

  private readonly locale = inject(LOCALE_ID)

  /** Les valeurs nutritionnelles sont optionnelles en base : « – » si non renseignées. */
  format(value: number | null | undefined): string {
    return value == null ? "–" : formatNumber(value, this.locale, "1.0-1")
  }
}
