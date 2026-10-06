import { Component, inject } from "@angular/core"
import { RouterLink } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { UserPreferencesService } from "core/services/user-preferences.service"
import { FeatureCardComponent } from "../feature-card/feature-card.component"
import { TodayMealsComponent } from "../today-meals/today-meals.component"

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, FeatureCardComponent, TodayMealsComponent],
  templateUrl: "./home-page.component.html",
  styleUrls: ["./home-page.component.scss"],
})
export class HomePageComponent {
  readonly preferences = inject(UserPreferencesService).preferences
}
