package com.squadz.back_app.controllers;

import com.squadz.back_app.models.ShoppingList;
import com.squadz.back_app.services.ShoppingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shopping-lists")
@CrossOrigin(origins = "*")
public class ShoppingListController {

@Autowired
private ShoppingListService shoppingListService;

@GetMapping("/user/{userId}")
public List<ShoppingList> getUserShoppingLists(@PathVariable Long userId) {
    return shoppingListService.getShoppingListsByUser(userId);
}

@PostMapping("/generate/{userId}")
public ShoppingList generateShoppingList(@PathVariable Long userId) {
    return shoppingListService.generateShoppingList(userId);
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteShoppingList(@PathVariable Long id) {
    shoppingListService.deleteShoppingList(id);
    return ResponseEntity.ok().build();
}
}