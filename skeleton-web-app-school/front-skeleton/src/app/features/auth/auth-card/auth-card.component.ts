import { Component, Input } from "@angular/core"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"

/** Carte centrée des pages de connexion / inscription : en-tête, formulaire projeté et pied (`[footer]`). */
@Component({
  selector: "app-auth-card",
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: "./auth-card.component.html",
  styleUrls: ["./auth-card.component.scss"],
})
export class AuthCardComponent {
  @Input({ required: true }) title!: string
  @Input() subtitle?: string
  @Input() icon = "lock"
}
