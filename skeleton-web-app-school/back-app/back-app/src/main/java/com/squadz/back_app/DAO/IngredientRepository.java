package com.squadz.back_app.DAO;

import com.squadz.back_app.models.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    // Tu pourras ajouter ici une recherche par nom si le front-end en a besoin
    // List<Ingredient> findByNameContainingIgnoreCase(String name);
}
