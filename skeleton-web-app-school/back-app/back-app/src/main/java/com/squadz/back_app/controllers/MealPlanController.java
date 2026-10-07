package com.squadz.back_app.controllers;

import com.squadz.back_app.models.MealPlan;
import com.squadz.back_app.services.MealPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meal-plans")
@CrossOrigin(origins = "*")
public class MealPlanController {

    @Autowired
    private MealPlanService mealPlanService;

    @GetMapping("/user/{userId}")
    public List<MealPlan> getUserMealPlans(@PathVariable Long userId) {
        return mealPlanService.getMealPlansByUser(userId);
    }

    @PostMapping
    public MealPlan createMealPlan(@RequestBody MealPlan mealPlan) {
        return mealPlanService.saveMealPlan(mealPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealPlan(@PathVariable Long id) {
        mealPlanService.deleteMealPlan(id);
        return ResponseEntity.ok().build();
    }
}