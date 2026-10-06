package com.squadz.back_app.models;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "recipe_ingredients")
@IdClass(RecipeIngredientId.class)
public class RecipeIngredient {

@Id
@Column(name = "recipe_id")
private Long recipeId;

@Id
@Column(name = "ingredient_id")
private Long ingredientId;

@Column(nullable = false, precision = 6, scale = 2)
private BigDecimal quantity;

public RecipeIngredient() {}

public Long getRecipeId() { return recipeId; }
public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }

public Long getIngredientId() { return ingredientId; }
public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

public BigDecimal getQuantity() { return quantity; }
public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
}