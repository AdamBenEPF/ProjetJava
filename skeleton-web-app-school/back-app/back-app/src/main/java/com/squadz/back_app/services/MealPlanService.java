package com.squadz.back_app.services;

import com.squadz.back_app.models.MealPlan;
import com.squadz.back_app.DAO.MealPlanDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MealPlanService {

@Autowired
private MealPlanDao mealPlanDao;

public List<MealPlan> getAllMealPlans() {
    return mealPlanDao.findAll();
}

public Optional<MealPlan> getMealPlanById(Long id) {
    return mealPlanDao.findById(id);
}

public List<MealPlan> getMealPlansByUser(Long userId) {
    return mealPlanDao.findByUserId(userId);
}

public MealPlan saveMealPlan(MealPlan mealPlan) {
    return mealPlanDao.save(mealPlan);
}

public void deleteMealPlan(Long id) {
    mealPlanDao.deleteById(id);
}
}