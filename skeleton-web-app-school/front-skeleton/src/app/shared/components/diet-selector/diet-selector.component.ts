import { Component, EventEmitter, Input, Output } from "@angular/core"
import { Regime } from "core/models/enums.model"

interface DietOption {
  value: Regime | null
  label: string
  emoji: string
  description: string
}

/** Sélection visuelle du régime alimentaire (cartes cliquables). */
@Component({
  selector: "app-diet-selector",
  standalone: true,
  templateUrl: "./diet-selector.component.html",
  styleUrls: ["./diet-selector.component.scss"],
})
export class DietSelectorComponent {
  @Input() value: Regime | null = null
  @Output() valueChange = new EventEmitter<Regime | null>()

  readonly options: DietOption[] = [
    { value: null, label: "Sans préférence", emoji: "🍴", description: "Toutes les recettes sont proposées." },
    { value: "VIANDE", label: "Viande", emoji: "🍗", description: "Viande et poisson inclus." },
    { value: "VEGETARIEN", label: "Végétarien", emoji: "🧀", description: "Sans viande ni poisson." },
    { value: "VEGAN", label: "Vegan", emoji: "🌱", description: "Aucun produit d'origine animale." },
  ]

  select(value: Regime | null): void {
    this.value = value
    this.valueChange.emit(value)
  }
}
