package com.squadz.back_app.services;

import com.squadz.back_app.DAO.RecipeIngredientRepository;
import com.squadz.back_app.DAO.RecipeRepository;
import com.squadz.back_app.DTO.IngredientQuantityDTO;
import com.squadz.back_app.DTO.RecipeCreationDTO;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.models.RecipeIngredient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;

    public RecipeService(RecipeRepository recipeRepository, RecipeIngredientRepository recipeIngredientRepository) {
        this.recipeRepository = recipeRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
    }

    // 1. Lister et filtrer les recettes (le catalogue)
    public List<Recipe> getRecipesByFilters(String dietType, String mealType) {
        if (dietType != null && mealType != null) {
            return recipeRepository.findByDietTypeAndMealType(dietType, mealType);
        } else if (dietType != null) {
            return recipeRepository.findByDietType(dietType);
        } else if (mealType != null) {
            return recipeRepository.findByMealType(mealType);
        }
        return recipeRepository.findAll();
    }

    // 2. Créer une recette complexe à partir du DTO
    @Transactional
    public Recipe createRecipeWithIngredients(RecipeCreationDTO dto) {
        // Étape A : Créer et sauvegarder l'entité Recipe
        Recipe recipe = new Recipe(
                dto.getTitle(),
                dto.getMealType(),
                dto.getDietType(),
                dto.getCalories(),
                dto.getProteins(),
                dto.getCarbs(),
                dto.getFats()
        );
        
        Recipe savedRecipe = recipeRepository.save(recipe);

        // Étape B : Associer les ingrédients avec leurs quantités
        if (dto.getIngredients() != null && !dto.getIngredients().isEmpty()) {
            for (IngredientQuantityDTO iqDto : dto.getIngredients()) {
                RecipeIngredient recipeIngredient = new RecipeIngredient();
                
                // On utilise l'ID de la recette qu'on vient tout juste de sauvegarder
                recipeIngredient.setRecipeId(savedRecipe.getId());
                recipeIngredient.setIngredientId(iqDto.getIngredientId());
                recipeIngredient.setQuantity(iqDto.getQuantity());

                recipeIngredientRepository.save(recipeIngredient);
            }
        }

        return savedRecipe;
    }
}
