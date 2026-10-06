package com.squadz.back_app.DTO;

import java.math.BigDecimal;

public class IngredientQuantityDTO {
    
    private Long ingredientId;
    private BigDecimal quantity;

    public IngredientQuantityDTO() {}

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
}
