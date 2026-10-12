package com.squadz.back_app.DTO;

import java.math.BigDecimal;

public class RecipeIngredientResponse {

    private Long ingredientId;
    private String name;
    private String unit;
    private BigDecimal quantity;

    public RecipeIngredientResponse() {}

    public RecipeIngredientResponse(Long ingredientId, String name, String unit, BigDecimal quantity) {
        this.ingredientId = ingredientId;
        this.name = name;
        this.unit = unit;
        this.quantity = quantity;
    }

    public Long getIngredientId() { return ingredientId; }
    public String getName() { return name; }
    public String getUnit() { return unit; }
    public BigDecimal getQuantity() { return quantity; }
}
