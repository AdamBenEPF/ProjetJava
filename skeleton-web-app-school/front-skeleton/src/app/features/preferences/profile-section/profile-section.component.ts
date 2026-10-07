import { Component, Input } from "@angular/core"
import { FormControl, ReactiveFormsModule } from "@angular/forms"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatIconModule } from "@angular/material/icon"

/** Carte « Profil » : nom modifiable, email du compte connecté en lecture seule. */
@Component({
  selector: "app-profile-section",
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: "./profile-section.component.html",
  styleUrls: ["./profile-section.component.scss"],
})
export class ProfileSectionComponent {
  @Input({ required: true }) nameControl!: FormControl<string>
  @Input({ required: true }) email!: string
}
