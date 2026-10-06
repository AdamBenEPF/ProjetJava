import { Component, Input } from "@angular/core"
import { Regime } from "core/models/enums.model"
import { RegimeLabelPipe } from "shared/pipes/regime-label.pipe"

const REGIME_ICONS: Record<Regime, string> = {
  VIANDE: "🍗",
  VEGETARIEN: "🧀",
  VEGAN: "🌱",
}

@Component({
  selector: "app-diet-badge",
  standalone: true,
  imports: [RegimeLabelPipe],
  template: `<span class="badge-diet" [class]="'diet-' + regime.toLowerCase()"
    >{{ icons[regime] }} {{ regime | regimeLabel }}</span
  >`,
  styles: `
    .badge-diet {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .diet-viande {
      background: #fde2e1;
      color: #a3261d;
    }
    .diet-vegetarien {
      background: #fff1cc;
      color: #8a5a00;
    }
    .diet-vegan {
      background: #dcf3e1;
      color: #1d6b34;
    }
  `,
})
export class DietBadgeComponent {
  @Input({ required: true }) regime!: Regime
  readonly icons = REGIME_ICONS
}
