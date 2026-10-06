package com.squadz.back_app.models;

import java.io.Serializable;
import java.util.Objects;

public class RecipeIngredientId implements Serializable {
private Long recipeId;
private Long ingredientId;

public RecipeIngredientId() {}

public RecipeIngredientId(Long recipeId, Long ingredientId) {
    this.recipeId = recipeId;
    this.ingredientId = ingredientId;
}

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof RecipeIngredientId)) return false;
    RecipeIngredientId that = (RecipeIngredientId) o;
    return Objects.equals(recipeId, that.recipeId) && Objects.equals(ingredientId, that.ingredientId);
}

@Override
public int hashCode() {
    return Objects.hash(recipeId, ingredientId);
}
}