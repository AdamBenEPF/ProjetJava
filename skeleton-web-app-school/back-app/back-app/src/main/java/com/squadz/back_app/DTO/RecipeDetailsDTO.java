package com.squadz.back_app.DTO;

import com.squadz.back_app.models.Recipe;

import java.math.BigDecimal;
import java.util.List;

// Recette renvoyée au front, avec ses ingrédients et leurs quantités
public record RecipeDetailsDTO(
        Long id,
        String title,
        String mealType,
        String dietType,
        Integer calories,
        Double proteins,
        Double carbs,
        Double fats,
        List<IngredientLine> ingredients) {

    public record IngredientLine(Long ingredientId, String name, String unit, BigDecimal quantity) {}

    public static RecipeDetailsDTO from(Recipe recipe, List<IngredientLine> ingredients) {
        return new RecipeDetailsDTO(recipe.getId(), recipe.getTitle(), recipe.getMealType(), recipe.getDietType(),
                recipe.getCalories(), recipe.getProteins(), recipe.getCarbs(), recipe.getFats(), ingredients);
    }
}
