package com.squadz.back_app.models;

import jakarta.persistence.*;

@Entity
@Table(name = "recipes")
public class Recipe {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false)
private String title;

@Column(name = "meal_type", nullable = false)
private String mealType;

@Column(name = "diet_type", nullable = false)
private String dietType;

private Integer calories;
private Double proteins;
private Double carbs;
private Double fats;

public Recipe() {}

public Recipe(String title, String mealType, String dietType, Integer calories, Double proteins, Double carbs, Double fats) {
    this.title = title;
    this.mealType = mealType;
    this.dietType = dietType;
    this.calories = calories;
    this.proteins = proteins;
    this.carbs = carbs;
    this.fats = fats;
}

public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

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
}