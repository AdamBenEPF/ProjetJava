package com.squadz.back_app.DAO;

import com.squadz.back_app.models.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShoppingListDao extends JpaRepository<ShoppingList, Long> {
    List findByUserId(Long userId);
}