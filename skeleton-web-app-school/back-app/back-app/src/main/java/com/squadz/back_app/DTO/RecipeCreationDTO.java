package com.squadz.back_app.DTO;

import java.util.List;

public class RecipeCreationDTO {

    private String title;
    private String mealType;
    private String dietType;
    private Integer calories;
    private Double proteins;
    private Double carbs;
    private Double fats;
    
    // La fameuse liste des ingrédients avec leurs quantités
    private List<IngredientQuantityDTO> ingredients;

    public RecipeCreationDTO() {}

    // Getters et Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }

    public String getDietType() { return dietType; }
    public void setDietType(String dietType) { this.dietType = dietType; }

    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }

    public Double getProteins() { return proteins; }
    public void setProteins(Double proteins) { this.proteins = proteins; }

    public Double getCarbs() { return carbs; }
    public void setCarbs(Double carbs) { this.carbs = carbs; }

    public Double getFats() { return fats; }
    public void setFats(Double fats) { this.fats = fats; }

    public List<IngredientQuantityDTO> getIngredients() { return ingredients; }
    public void setIngredients(List<IngredientQuantityDTO> ingredients) { this.ingredients = ingredients; }
}
