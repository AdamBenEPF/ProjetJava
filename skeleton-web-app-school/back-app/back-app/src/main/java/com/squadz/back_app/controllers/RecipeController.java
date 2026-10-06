package com.squadz.back_app.controllers;

import com.squadz.back_app.DTO.RecipeCreationDTO;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.services.RecipeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*") // À ajuster plus tard avec l'URL exacte de ton front-end
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    // Endpoint pour lister et filtrer le catalogue : GET /api/recipes?dietType=vegan&mealType=midi
    @GetMapping
    public List<Recipe> getRecipes(
            @RequestParam(required = false) String dietType,
            @RequestParam(required = false) String mealType) {
        return recipeService.getRecipesByFilters(dietType, mealType);
    }

    // Endpoint pour créer une recette et ses ingrédients : POST /api/recipes
    @PostMapping
    public Recipe createRecipe(@RequestBody RecipeCreationDTO recipeDTO) {
        return recipeService.createRecipeWithIngredients(recipeDTO);
    }
}
