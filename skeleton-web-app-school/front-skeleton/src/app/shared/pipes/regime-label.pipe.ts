import { Pipe, PipeTransform } from "@angular/core"
import { REGIME_LABELS, Regime } from "core/models/enums.model"

@Pipe({ name: "regimeLabel", standalone: true })
export class RegimeLabelPipe implements PipeTransform {
  transform(value: Regime | null | undefined): string {
    return value ? REGIME_LABELS[value] : "Tous"
  }
}
