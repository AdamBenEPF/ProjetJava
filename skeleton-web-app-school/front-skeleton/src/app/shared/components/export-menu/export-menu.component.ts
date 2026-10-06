import { Component, EventEmitter, Input, Output } from "@angular/core"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"

export interface ExportOption<T extends string = string> {
  format: T
  label: string
  icon: string
}

/** Bouton « Exporter » ouvrant un menu des formats disponibles. */
@Component({
  selector: "app-export-menu",
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <button mat-flat-button color="accent" [matMenuTriggerFor]="menu" [disabled]="disabled">
      <mat-icon>download</mat-icon>
      {{ label }}
    </button>
    <mat-menu #menu="matMenu">
      @for (option of options; track option.format) {
      <button mat-menu-item (click)="exportRequested.emit(option.format)">
        <mat-icon>{{ option.icon }}</mat-icon>
        <span>{{ option.label }}</span>
      </button>
      }
    </mat-menu>
  `,
})
export class ExportMenuComponent<T extends string = string> {
  @Input({ required: true }) options!: ExportOption<T>[]
  @Input() label = "Exporter"
  @Input() disabled = false
  @Output() exportRequested = new EventEmitter<T>()
}
