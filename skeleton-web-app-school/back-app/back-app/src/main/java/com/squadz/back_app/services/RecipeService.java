package com.squadz.back_app.services;

import com.squadz.back_app.DAO.IngredientRepository;
import com.squadz.back_app.DAO.RecipeIngredientRepository;
import com.squadz.back_app.DAO.RecipeRepository;
import com.squadz.back_app.DTO.IngredientQuantityDTO;
import com.squadz.back_app.DTO.RecipeCreationDTO;
import com.squadz.back_app.DTO.RecipeDetailsDTO;
import com.squadz.back_app.models.Ingredient;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.models.RecipeIngredient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientRepository ingredientRepository;

    public RecipeService(RecipeRepository recipeRepository, RecipeIngredientRepository recipeIngredientRepository,
                         IngredientRepository ingredientRepository) {
        this.recipeRepository = recipeRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.ingredientRepository = ingredientRepository;
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

    // 3. Ajouter à chaque recette ses ingrédients (nom, unité, quantité) pour l'affichage côté front
    public List<RecipeDetailsDTO> withIngredients(List<Recipe> recipes) {
        if (recipes.isEmpty()) {
            return List.of();
        }
        List<Long> recipeIds = recipes.stream().map(Recipe::getId).toList();
        List<RecipeIngredient> lines = recipeIngredientRepository.findByRecipeIdIn(recipeIds);

        List<Long> ingredientIds = lines.stream().map(RecipeIngredient::getIngredientId).distinct().toList();
        Map<Long, Ingredient> ingredientsById = ingredientRepository.findAllById(ingredientIds).stream()
                .collect(Collectors.toMap(Ingredient::getId, Function.identity()));

        Map<Long, List<RecipeDetailsDTO.IngredientLine>> linesByRecipe = lines.stream()
                .filter(line -> ingredientsById.containsKey(line.getIngredientId()))
                .collect(Collectors.groupingBy(RecipeIngredient::getRecipeId, Collectors.mapping(line -> {
                    Ingredient ingredient = ingredientsById.get(line.getIngredientId());
                    return new RecipeDetailsDTO.IngredientLine(
                            ingredient.getId(), ingredient.getName(), ingredient.getUnit(), line.getQuantity());
                }, Collectors.toList())));

        return recipes.stream()
                .map(recipe -> RecipeDetailsDTO.from(recipe, linesByRecipe.getOrDefault(recipe.getId(), List.of())))
                .toList();
    }
}
