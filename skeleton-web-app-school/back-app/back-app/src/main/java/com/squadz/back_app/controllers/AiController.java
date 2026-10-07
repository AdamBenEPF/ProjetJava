package com.squadz.back_app.controllers;

import com.squadz.back_app.models.MealPlan;
import com.squadz.back_app.services.AiMealService;
import com.squadz.back_app.services.MealPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

@Autowired
private AiMealService aiMealService;

@Autowired
private MealPlanService mealPlanService;

@GetMapping("/suggest")
public String suggestMeal(@RequestParam String dietType) {
    return aiMealService.generateMealSuggestion(dietType);
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
public String suggestMultipleMeals(@RequestParam String dietType) {
    return aiMealService.generateMultipleMeals(dietType);
}

@PostMapping("/generate-and-save")
public List<Recipe> generateAndSaveMeals(@RequestParam String dietType) {
    return aiMealService.generateAndSaveMultipleMeals(dietType);
}

}