package com.squadz.back_app.services;

import com.squadz.back_app.models.ShoppingList;
import com.squadz.back_app.DAO.ShoppingListDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShoppingListService {

@Autowired
private ShoppingListDao shoppingListRepository;

public List<ShoppingList> getShoppingListsByUser(Long userId) {
    return shoppingListRepository.findByUserId(userId);
}

public ShoppingList generateShoppingList(Long userId) {
    ShoppingList shoppingList = new ShoppingList();
    shoppingList.setUserId(userId);
    shoppingList.setDateGeneration(LocalDateTime.now());
    return shoppingListRepository.save(shoppingList);
}

public void deleteShoppingList(Long id) {
    shoppingListRepository.deleteById(id);
}
}