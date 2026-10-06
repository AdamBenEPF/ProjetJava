import { Component, Input } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"

/** En-tête de page : icône, titre, sous-titre et zone d'actions projetée (`<ng-content>`). */
@Component({
  selector: "app-page-header",
  standalone: true,
  imports: [MatIconModule],
  templateUrl: "./page-header.component.html",
  styleUrls: ["./page-header.component.scss"],
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string
  @Input() subtitle?: string
  @Input() icon?: string
}
