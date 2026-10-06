package com.squadz.back_app.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "meal_plans")
public class MealPlan {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(name = "user_id", nullable = false)
private Long userId;

@Column(name = "recipe_id", nullable = false)
private Long recipeId;

@Column(nullable = false)
private LocalDate date;

@Column(name = "moment_repas", nullable = false, length = 50)
private String momentRepas;

public MealPlan() {}

public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public Long getUserId() { return userId; }
public void setUserId(Long userId) { this.userId = userId; }

public Long getRecipeId() { return recipeId; }
public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }

public LocalDate getDate() { return date; }
public void setDate(LocalDate date) { this.date = date; }

public String getMomentRepas() { return momentRepas; }
public void setMomentRepas(String momentRepas) { this.momentRepas = momentRepas; }
}