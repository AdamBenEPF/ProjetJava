package com.squadz.back_app.DAO;

import com.squadz.back_app.models.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    
    // Lister et filtrer par type de régime (ex: "vegan", "végétarien")
    List<Recipe> findByDietType(String dietType);
    
    // Lister et filtrer par type de repas (ex: "matin", "midi", "soir")
    List<Recipe> findByMealType(String mealType);
    
    // Combiner les deux filtres
    List<Recipe> findByDietTypeAndMealType(String dietType, String mealType);
}
