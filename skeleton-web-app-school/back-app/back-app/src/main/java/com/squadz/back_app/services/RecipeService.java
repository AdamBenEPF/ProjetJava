package com.squadz.back_app.services;

import com.squadz.back_app.DAO.IngredientRepository;
import com.squadz.back_app.DAO.RecipeIngredientRepository;
import com.squadz.back_app.DAO.RecipeRepository;
import com.squadz.back_app.DTO.IngredientQuantityDTO;
import com.squadz.back_app.DTO.RecipeCreationDTO;
import com.squadz.back_app.DTO.RecipeDetailsDTO;
import com.squadz.back_app.DTO.RecipeIngredientResponse;
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

    public RecipeService(RecipeRepository recipeRepository,
                         RecipeIngredientRepository recipeIngredientRepository,
                         IngredientRepository ingredientRepository) {
        this.recipeRepository = recipeRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<Recipe> getRecipesByFilters(String dietType, String mealType) {
        if (dietType != null && mealType != null) {
            return recipeRepository.findByDietTypeAndMealType(dietType, mealType);
        }
        if (dietType != null) return recipeRepository.findByDietType(dietType);
        if (mealType != null) return recipeRepository.findByMealType(mealType);
        return recipeRepository.findAll();
    }

    @Transactional
    public Recipe createRecipeWithIngredients(RecipeCreationDTO dto) {
        Recipe recipe = new Recipe(dto.getTitle(), dto.getMealType(), dto.getDietType(),
                dto.getCalories(), dto.getProteins(), dto.getCarbs(), dto.getFats());
        Recipe savedRecipe = recipeRepository.save(recipe);
        if (dto.getIngredients() != null) {
            for (IngredientQuantityDTO ingredient : dto.getIngredients()) {
                RecipeIngredient link = new RecipeIngredient();
                link.setRecipeId(savedRecipe.getId());
                link.setIngredientId(ingredient.getIngredientId());
                link.setQuantity(ingredient.getQuantity());
                recipeIngredientRepository.save(link);
            }
        }
        return savedRecipe;
    }

    public List<RecipeDetailsDTO> withIngredients(List<Recipe> recipes) {
        if (recipes.isEmpty()) return List.of();
        List<Long> recipeIds = recipes.stream().map(Recipe::getId).toList();
        List<RecipeIngredient> lines = recipeIngredientRepository.findByRecipeIdIn(recipeIds);
        List<Long> ingredientIds = lines.stream().map(RecipeIngredient::getIngredientId).distinct().toList();
        Map<Long, Ingredient> byId = ingredientRepository.findAllById(ingredientIds).stream()
                .collect(Collectors.toMap(Ingredient::getId, Function.identity()));
        Map<Long, List<RecipeDetailsDTO.IngredientLine>> byRecipe = lines.stream()
                .filter(line -> byId.containsKey(line.getIngredientId()))
                .collect(Collectors.groupingBy(RecipeIngredient::getRecipeId, Collectors.mapping(line -> {
                    Ingredient ingredient = byId.get(line.getIngredientId());
                    return new RecipeDetailsDTO.IngredientLine(
                            ingredient.getId(), ingredient.getName(), ingredient.getUnit(), line.getQuantity());
                }, Collectors.toList())));
        return recipes.stream()
                .map(recipe -> RecipeDetailsDTO.from(recipe, byRecipe.getOrDefault(recipe.getId(), List.of())))
                .toList();
    }

    public List<RecipeIngredientResponse> getRecipeIngredients(Long recipeId) {
        if (!recipeRepository.existsById(recipeId)) {
            throw new IllegalArgumentException("Recette introuvable : " + recipeId);
        }
        return recipeIngredientRepository.findByRecipeId(recipeId).stream().map(link -> {
            Ingredient ingredient = ingredientRepository.findById(link.getIngredientId())
                    .orElseThrow(() -> new IllegalStateException("Ingrédient introuvable."));
            return new RecipeIngredientResponse(ingredient.getId(), ingredient.getName(),
                    ingredient.getUnit(), link.getQuantity());
        }).toList();
    }
}
