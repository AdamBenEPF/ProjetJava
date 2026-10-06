import { Injectable } from "@angular/core"
import { PlanningRepas } from "core/models/meal-plan.model"
import { ShoppingListItem } from "core/models/shopping-list.model"
import { TYPES_REPAS, TYPE_REPAS_LABELS, TypeRepas } from "core/models/enums.model"
import { fromIsoDate } from "core/utils/date.utils"
import { downloadFile } from "core/utils/download.utils"

export type ExportFormat = "csv" | "ics" | "txt" | "print"
export type ShoppingListExportFormat = Exclude<ExportFormat, "ics">

/** Horaires utilisés pour placer les repas dans un agenda (.ics). */
const MEAL_HOURS: Record<TypeRepas, { start: string; end: string }> = {
  PETIT_DEJEUNER: { start: "080000", end: "083000" },
  MIDI: { start: "123000", end: "133000" },
  SOIR: { start: "193000", end: "203000" },
}

/** Séparateur `;` + BOM UTF-8 : le CSV s'ouvre directement dans un Excel français. */
const CSV_SEPARATOR = ";"
const UTF8_BOM = "\uFEFF"

@Injectable({ providedIn: "root" })
export class ExportService {
  exportPlanning(format: ExportFormat, plans: PlanningRepas[], startDate: string, endDate: string): void {
    const sorted = this.sortPlans(plans)
    const baseName = `planning_${startDate}_${endDate}`
    switch (format) {
      case "csv":
        return downloadFile(this.planningToCsv(sorted), `${baseName}.csv`, "text/csv")
      case "ics":
        return downloadFile(this.planningToIcs(sorted), `${baseName}.ics`, "text/calendar")
      case "txt":
        return downloadFile(this.planningToText(sorted), `${baseName}.txt`, "text/plain")
      case "print":
        return window.print()
    }
  }

  exportShoppingList(
    format: ShoppingListExportFormat,
    items: ShoppingListItem[],
    startDate: string,
    endDate: string,
  ): void {
    const baseName = `liste-courses_${startDate}_${endDate}`
    switch (format) {
      case "csv":
        return downloadFile(this.shoppingListToCsv(items), `${baseName}.csv`, "text/csv")
      case "txt":
        return downloadFile(this.shoppingListToText(items, startDate, endDate), `${baseName}.txt`, "text/plain")
      case "print":
        return window.print()
    }
  }

  private planningToCsv(plans: PlanningRepas[]): string {
    const header = [
      "Date",
      "Jour",
      "Repas",
      "Recette",
      "Régime",
      "Calories",
      "Protéines (g)",
      "Glucides (g)",
      "Lipides (g)",
    ]
    const rows = plans.map((plan) => [
      plan.date,
      this.dayName(plan.date),
      TYPE_REPAS_LABELS[plan.momentRepas],
      plan.recette.titre,
      plan.recette.typeRegime,
      plan.recette.calories ?? "",
      plan.recette.proteines ?? "",
      plan.recette.glucides ?? "",
      plan.recette.lipides ?? "",
    ])
    return this.toCsv([header, ...rows])
  }

  private planningToText(plans: PlanningRepas[]): string {
    const lines: string[] = []
    let currentDate = ""
    for (const plan of plans) {
      if (plan.date !== currentDate) {
        currentDate = plan.date
        lines.push("", `${this.dayName(plan.date)} ${fromIsoDate(plan.date).toLocaleDateString("fr-FR")}`)
      }
      const calories = plan.recette.calories ? ` (${plan.recette.calories} kcal)` : ""
      lines.push(`  - ${TYPE_REPAS_LABELS[plan.momentRepas]} : ${plan.recette.titre}${calories}`)
    }
    return ["PLANNING DES REPAS", ...lines].join("\n")
  }

  private planningToIcs(plans: PlanningRepas[]): string {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const events = plans.flatMap((plan, index) => {
      const day = plan.date.replace(/-/g, "")
      const hours = MEAL_HOURS[plan.momentRepas]
      return [
        "BEGIN:VEVENT",
        `UID:repas-${plan.id ?? index}-${day}@planning-repas`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${day}T${hours.start}`,
        `DTEND:${day}T${hours.end}`,
        `SUMMARY:${this.escapeIcs(`${TYPE_REPAS_LABELS[plan.momentRepas]} : ${plan.recette.titre}`)}`,
        `DESCRIPTION:${this.escapeIcs(this.recipeDescription(plan))}`,
        "END:VEVENT",
      ]
    })
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Planning Repas//FR", ...events, "END:VCALENDAR"].join("\r\n")
  }

  private shoppingListToCsv(items: ShoppingListItem[]): string {
    const rows = items.map((item) => [item.nom, this.formatQuantity(item.quantite), item.unite])
    return this.toCsv([["Ingrédient", "Quantité", "Unité"], ...rows])
  }

  private shoppingListToText(items: ShoppingListItem[], startDate: string, endDate: string): string {
    const period = `${fromIsoDate(startDate).toLocaleDateString("fr-FR")} au ${fromIsoDate(endDate).toLocaleDateString(
      "fr-FR",
    )}`
    const lines = items.map((item) => `[ ] ${item.nom} — ${this.formatQuantity(item.quantite)} ${item.unite}`)
    return [`LISTE DE COURSES (semaine du ${period})`, "", ...lines].join("\n")
  }

  private recipeDescription(plan: PlanningRepas): string {
    const { calories, proteines, glucides, lipides } = plan.recette
    if (calories == null) return plan.recette.titre
    return `${calories} kcal — P ${proteines ?? "?"} g / G ${glucides ?? "?"} g / L ${lipides ?? "?"} g`
  }

  private sortPlans(plans: PlanningRepas[]): PlanningRepas[] {
    return [...plans].sort(
      (a, b) => a.date.localeCompare(b.date) || TYPES_REPAS.indexOf(a.momentRepas) - TYPES_REPAS.indexOf(b.momentRepas),
    )
  }

  private dayName(isoDate: string): string {
    const name = fromIsoDate(isoDate).toLocaleDateString("fr-FR", { weekday: "long" })
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  private formatQuantity(quantity: number): string {
    return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2).replace(".", ",")
  }

  private toCsv(rows: (string | number)[][]): string {
    const escape = (value: string | number) => {
      const text = String(value)
      return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    return UTF8_BOM + rows.map((row) => row.map(escape).join(CSV_SEPARATOR)).join("\r\n")
  }

  private escapeIcs(text: string): string {
    return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
  }
}
