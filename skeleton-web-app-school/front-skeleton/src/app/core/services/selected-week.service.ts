import { Injectable, computed, signal } from "@angular/core"
import { addDays, startOfWeek, toIsoDate, weekDays } from "core/utils/date.utils"

/** Semaine affichée, partagée entre le planning et la liste de courses. */
@Injectable({ providedIn: "root" })
export class SelectedWeekService {
  private readonly start = signal(startOfWeek(new Date()))

  readonly weekStart = this.start.asReadonly()
  readonly weekEnd = computed(() => addDays(this.start(), 6))
  readonly days = computed(() => weekDays(this.start()))
  readonly startIso = computed(() => toIsoDate(this.start()))
  readonly endIso = computed(() => toIsoDate(this.weekEnd()))

  previous(): void {
    this.start.update((date) => addDays(date, -7))
  }

  next(): void {
    this.start.update((date) => addDays(date, 7))
  }

  today(): void {
    this.start.set(startOfWeek(new Date()))
  }
}
