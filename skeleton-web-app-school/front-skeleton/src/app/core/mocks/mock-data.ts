import { Recette } from "core/models/recipe.model"
import { RegisterDto, UserDto } from "core/api/api.model"

const ing = (id: number, nom: string, unite: string, quantite: number) => ({ ingredient: { id, nom, unite }, quantite })

/** Jeu de données de démonstration, utilisé uniquement en mode mock. */
export const MOCK_RECIPES: Recette[] = [
  {
    id: 1,
    titre: "Porridge avoine, banane et cannelle",
    typeRepas: "PETIT_DEJEUNER",
    typeRegime: "VEGAN",
    calories: 380,
    proteines: 11.5,
    glucides: 64,
    lipides: 8.2,
    ingredients: [
      ing(1, "Flocons d'avoine", "grammes", 60),
      ing(2, "Lait d'amande", "millilitres", 200),
      ing(3, "Banane", "pieces", 1),
    ],
  },
  {
    id: 2,
    titre: "Omelette aux herbes et pain complet",
    typeRepas: "PETIT_DEJEUNER",
    typeRegime: "VEGETARIEN",
    calories: 420,
    proteines: 24,
    glucides: 30,
    lipides: 21,
    ingredients: [
      ing(4, "Oeuf", "pieces", 3),
      ing(5, "Pain complet", "grammes", 60),
      ing(6, "Ciboulette", "grammes", 5),
    ],
  },
  {
    id: 3,
    titre: "Bagel saumon fumé et fromage frais",
    typeRepas: "PETIT_DEJEUNER",
    typeRegime: "VIANDE",
    calories: 450,
    proteines: 26,
    glucides: 48,
    lipides: 16,
    ingredients: [
      ing(7, "Bagel", "pieces", 1),
      ing(8, "Saumon fumé", "grammes", 60),
      ing(9, "Fromage frais", "grammes", 30),
    ],
  },
  {
    id: 4,
    titre: "Poulet rôti, riz et brocolis",
    typeRepas: "MIDI",
    typeRegime: "VIANDE",
    calories: 620,
    proteines: 45,
    glucides: 70,
    lipides: 14,
    ingredients: [
      ing(10, "Blanc de poulet", "grammes", 150),
      ing(11, "Riz basmati", "grammes", 80),
      ing(12, "Brocoli", "grammes", 150),
    ],
  },
  {
    id: 5,
    titre: "Buddha bowl pois chiches et quinoa",
    typeRepas: "MIDI",
    typeRegime: "VEGAN",
    calories: 560,
    proteines: 21,
    glucides: 78,
    lipides: 17,
    ingredients: [
      ing(13, "Quinoa", "grammes", 70),
      ing(14, "Pois chiches", "grammes", 120),
      ing(15, "Avocat", "pieces", 0.5),
      ing(16, "Carotte", "pieces", 1),
    ],
  },
  {
    id: 6,
    titre: "Lasagnes aux légumes",
    typeRepas: "MIDI",
    typeRegime: "VEGETARIEN",
    calories: 590,
    proteines: 26,
    glucides: 62,
    lipides: 24,
    ingredients: [
      ing(17, "Pâtes à lasagnes", "grammes", 100),
      ing(18, "Courgette", "pieces", 1),
      ing(19, "Mozzarella", "grammes", 60),
      ing(20, "Coulis de tomate", "millilitres", 150),
    ],
  },
  {
    id: 7,
    titre: "Saumon, patate douce et haricots verts",
    typeRepas: "SOIR",
    typeRegime: "VIANDE",
    calories: 540,
    proteines: 36,
    glucides: 42,
    lipides: 22,
    ingredients: [
      ing(21, "Pavé de saumon", "grammes", 140),
      ing(22, "Patate douce", "grammes", 200),
      ing(23, "Haricots verts", "grammes", 120),
    ],
  },
  {
    id: 8,
    titre: "Curry de lentilles corail au lait de coco",
    typeRepas: "SOIR",
    typeRegime: "VEGAN",
    calories: 510,
    proteines: 22,
    glucides: 66,
    lipides: 16,
    ingredients: [
      ing(24, "Lentilles corail", "grammes", 80),
      ing(25, "Lait de coco", "millilitres", 100),
      ing(26, "Oignon", "pieces", 1),
      ing(11, "Riz basmati", "grammes", 60),
    ],
  },
  {
    id: 9,
    titre: "Velouté de potiron et tartines au chèvre",
    typeRepas: "SOIR",
    typeRegime: "VEGETARIEN",
    calories: 470,
    proteines: 17,
    glucides: 52,
    lipides: 20,
    ingredients: [
      ing(27, "Potiron", "grammes", 300),
      ing(28, "Fromage de chèvre", "grammes", 50),
      ing(5, "Pain complet", "grammes", 60),
      ing(26, "Oignon", "pieces", 0.5),
    ],
  },
]

/** Comptes de démonstration, au format du back (mêmes identifiants que V2__insert_default_data.sql). */
export const MOCK_USERS: (UserDto & RegisterDto)[] = [
  { id: 1, name: "Alice Martin", email: "alice@example.com", password: "password123", dietPreference: "Vegetarian" },
  { id: 2, name: "Thomas Bernard", email: "thomas@example.com", password: "password123", dietPreference: "Omnivore" },
]
