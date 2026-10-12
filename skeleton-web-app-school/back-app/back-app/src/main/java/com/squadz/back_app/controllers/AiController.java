package com.squadz.back_app.controllers;

import com.squadz.back_app.DTO.RecipeDetailsDTO;
import com.squadz.back_app.models.MealPlan;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.DTO.PersonalizedMealRequest;
import com.squadz.back_app.services.AiMealService;
import com.squadz.back_app.services.MealPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

@Autowired
private AiMealService aiMealService;

@Autowired
private MealPlanService mealPlanService;


@PostMapping("/personalized")
public Recipe generatePersonalizedMeal(@RequestBody PersonalizedMealRequest criteria) {
    return aiMealService.generateAndSavePersonalizedMeal(criteria);
}

@GetMapping("/suggest")
public List<Recipe> suggestMeal(@RequestParam String dietType) {
    return aiMealService.generateAndSavePersonalizedMeals(dietType);

}

@PostMapping("/plan-suggested-meal")
public MealPlan planSuggestedMeal(@RequestParam Long userId, @RequestParam Long recipeId, @RequestParam String date, @RequestParam String momentRepas) {
    MealPlan mealPlan = new MealPlan();
    mealPlan.setUserId(userId);
    mealPlan.setRecipeId(recipeId);
    mealPlan.setDate(LocalDate.parse(date));
    mealPlan.setMomentRepas(momentRepas);
    
    return mealPlanService.saveMealPlan(mealPlan);
}

@GetMapping("/suggest-batch")
public List<Recipe> suggestMultipleMeals(@RequestParam String dietType) {
    return aiMealService.generateAndSavePersonalizedMeals(dietType);
}

@PostMapping("/generate-and-save")
public List<Recipe> generateAndSaveMeals(@RequestParam String dietType) {
    return aiMealService.generateAndSavePersonalizedMeals(dietType);
}

}