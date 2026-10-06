package com.squadz.back_app.services;

import com.squadz.back_app.DAO.IngredientRepository;
import com.squadz.back_app.models.Ingredient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public IngredientService(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    // Récupérer toute la liste des ingrédients (utile pour les menus déroulants du front)
    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    // Ajouter un nouvel ingrédient à la base
    public Ingredient saveIngredient(Ingredient ingredient) {
        return ingredientRepository.save(ingredient);
    }
}
