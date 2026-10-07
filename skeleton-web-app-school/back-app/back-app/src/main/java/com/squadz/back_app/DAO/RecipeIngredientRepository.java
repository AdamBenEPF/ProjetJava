package com.squadz.back_app.DAO;

import com.squadz.back_app.models.RecipeIngredient;
import com.squadz.back_app.models.RecipeIngredientId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, RecipeIngredientId> {
    
    // Récupérer tous les ingrédients (et leurs quantités) pour une recette donnée.
    // Indispensable plus tard pour générer la liste de courses globale.
    List<RecipeIngredient> findByRecipeId(Long recipeId);

    // Même chose pour plusieurs recettes en une seule requête (affichage du catalogue).
    List<RecipeIngredient> findByRecipeIdIn(List<Long> recipeIds);
    
    // Savoir dans quelles recettes un ingrédient spécifique est utilisé.
    // Très pratique si tu veux exclure des recettes contenant un allergène précis.
    List<RecipeIngredient> findByIngredientId(Long ingredientId);
}
