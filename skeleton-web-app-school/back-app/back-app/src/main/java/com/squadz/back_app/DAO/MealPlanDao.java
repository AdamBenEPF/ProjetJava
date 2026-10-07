package com.squadz.back_app.DAO;

import com.squadz.back_app.models.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealPlanDao extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByUserId(Long userId);

    List<MealPlan> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}