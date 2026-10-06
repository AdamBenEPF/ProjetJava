import { Pipe, PipeTransform } from "@angular/core"
import { TYPE_REPAS_LABELS, TypeRepas } from "core/models/enums.model"

@Pipe({ name: "typeRepasLabel", standalone: true })
export class TypeRepasLabelPipe implements PipeTransform {
  transform(value: TypeRepas | null | undefined): string {
    return value ? TYPE_REPAS_LABELS[value] : "Tous"
  }
}
