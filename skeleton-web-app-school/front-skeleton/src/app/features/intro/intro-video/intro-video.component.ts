import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core"
import { NgTemplateOutlet } from "@angular/common"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { AuthService } from "core/services/auth.service"
import { IntroRecipesSceneComponent } from "../intro-recipes-scene/intro-recipes-scene.component"
import { IntroPlanningSceneComponent } from "../intro-planning-scene/intro-planning-scene.component"
import { IntroShoppingSceneComponent } from "../intro-shopping-scene/intro-shopping-scene.component"

interface IntroScene {
  id: "accueil" | "recettes" | "planning" | "courses" | "fin"
  label: string
  /** Durée du chapitre en millisecondes (pilote la barre de progression). */
  duration: number
  icon?: string
  title?: string
}

const FOODS = ["🥑", "🍅", "🥕", "🍋", "🫑", "🍓", "🥦", "🧄"]

/**
 * Vidéo d'introduction du site, jouée en plein écran par-dessus l'application.
 * Les chapitres sont animés en CSS : la fin de l'animation de la barre de progression
 * fait passer au chapitre suivant, donc la pause (qui gèle toutes les animations) suspend aussi la lecture.
 */
@Component({
  selector: "app-intro-video",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    IntroRecipesSceneComponent,
    IntroPlanningSceneComponent,
    IntroShoppingSceneComponent,
  ],
  templateUrl: "./intro-video.component.html",
  styleUrls: ["./intro-video.component.scss"],
})
export class IntroVideoComponent implements AfterViewInit, OnDestroy {
  @Output() readonly closed = new EventEmitter<void>()
  @ViewChild("skipButton", { read: ElementRef }) private skipButton?: ElementRef<HTMLButtonElement>

  private readonly user = inject(AuthService).currentUser
  private readonly previousOverflow = document.body.style.overflow

  readonly foods = FOODS
  readonly scenes: IntroScene[] = [
    { id: "accueil", label: "Bienvenue", duration: 3800 },
    {
      id: "recettes",
      label: "Recettes",
      duration: 5200,
      icon: "menu_book",
      title: "Des recettes adaptées à votre régime, et l'IA pour en inventer d'autres",
    },
    {
      id: "planning",
      label: "Planning",
      duration: 5200,
      icon: "calendar_month",
      title: "Votre semaine planifiée en quelques clics",
    },
    {
      id: "courses",
      label: "Courses",
      duration: 4600,
      icon: "shopping_cart",
      title: "La liste de courses se remplit toute seule",
    },
    { id: "fin", label: "C'est parti", duration: 4500 },
  ]

  readonly current = signal(0)
  readonly paused = signal(false)
  readonly closing = signal(false)
  readonly scene = computed(() => this.scenes[this.current()])
  readonly greeting = computed(() => {
    const nom = this.user()?.nom
    return nom ? `Bon appétit, ${nom} !` : "Bon appétit !"
  })

  ngAfterViewInit(): void {
    document.body.style.overflow = "hidden"
    this.skipButton?.nativeElement.focus()
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousOverflow
  }

  next(): void {
    if (this.current() < this.scenes.length - 1) this.current.update((index) => index + 1)
    else this.finish()
  }

  previous(): void {
    this.current.update((index) => Math.max(0, index - 1))
  }

  togglePause(): void {
    this.paused.update((paused) => !paused)
  }

  /** Lance le fondu de sortie ; l'événement `closed` est émis à la fin de celui-ci. */
  finish(): void {
    this.paused.set(false)
    this.closing.set(true)
  }

  onAnimationEnd(event: AnimationEvent): void {
    // Les animations des chapitres remontent jusqu'ici : seul le fondu de sortie nous intéresse.
    if (this.closing() && event.target === event.currentTarget) this.closed.emit()
  }

  @HostListener("document:keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void {
    if (this.closing()) return
    switch (event.key) {
      case "Escape":
        this.finish()
        break
      case " ":
        // Sur un bouton, l'espace sert déjà à l'activer.
        if (event.target instanceof HTMLButtonElement) return
        this.togglePause()
        break
      case "ArrowRight":
        this.next()
        break
      case "ArrowLeft":
        this.previous()
        break
      default:
        return
    }
    event.preventDefault()
  }
}
