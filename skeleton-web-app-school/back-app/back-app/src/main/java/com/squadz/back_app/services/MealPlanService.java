package com.squadz.back_app.services;

import com.squadz.back_app.models.MealPlan;
import com.squadz.back_app.DAO.MealPlanDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class MealPlanService {
    @Autowired
    private MealPlanDao mealPlanDao;

    public List<MealPlan> getMealPlansByUser(Long userId) {
        return mealPlanDao.findByUserId(userId);
    }

    public List<MealPlan> getMealPlansByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return mealPlanDao.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    public MealPlan saveMealPlan(MealPlan mealPlan) {
        return mealPlanDao.save(mealPlan);
    }

    public void deleteMealPlan(Long id) {
        mealPlanDao.deleteById(id);
    }
}