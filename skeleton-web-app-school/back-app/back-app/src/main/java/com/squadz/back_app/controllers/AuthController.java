package com.squadz.back_app.controllers;

import com.squadz.back_app.DTO.LoginDTO;
import com.squadz.back_app.DTO.RegisterDTO;
import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.services.AiMealService;
import com.squadz.back_app.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;
    private final AiMealService aiMealService;

    public AuthController(UserService userService, AiMealService aiMealService) {
        this.userService = userService;
        this.aiMealService = aiMealService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO register(@RequestBody RegisterDTO registerDTO) {
        return userService.register(registerDTO);
    }

    @PostMapping("/login")
    public UserDTO login(@RequestBody LoginDTO loginDTO) {
        return userService.login(loginDTO);
    }

    @PostMapping("/login-init-meals")
    public List<Recipe> loginAndInitMeals(@RequestParam String dietType) {
        return aiMealService.generateAndSavePersonalizedMeals(dietType);
    }
}
