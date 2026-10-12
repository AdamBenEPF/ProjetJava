package com.squadz.back_app.controllers;

import com.squadz.back_app.DTO.RecipeCreationDTO;
import com.squadz.back_app.DTO.RecipeDetailsDTO;
import com.squadz.back_app.DTO.RecipeIngredientResponse;
import com.squadz.back_app.services.RecipeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*")
public class RecipeController {
    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public List<RecipeDetailsDTO> getRecipes(@RequestParam(required = false) String dietType,
                                              @RequestParam(required = false) String mealType) {
        return recipeService.withIngredients(recipeService.getRecipesByFilters(dietType, mealType));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeDetailsDTO createRecipe(@RequestBody RecipeCreationDTO recipeDTO) {
        return recipeService.withIngredients(List.of(
                recipeService.createRecipeWithIngredients(recipeDTO))).get(0);
    }

    @GetMapping("/{recipeId}/ingredients")
    public List<RecipeIngredientResponse> getRecipeIngredients(@PathVariable Long recipeId) {
        return recipeService.getRecipeIngredients(recipeId);
    }
}
