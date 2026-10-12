package com.squadz.back_app.controllers;

<<<<<<< HEAD
import com.squadz.back_app.DTO.LoginDTO;
import com.squadz.back_app.DTO.RegisterDTO;
import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
=======
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.services.AiMealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
>>>>>>> ccb12d7 (jout de l'ia)

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

<<<<<<< HEAD
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint d'inscription : POST /api/auth/register
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO register(@RequestBody RegisterDTO registerDTO) {
        return userService.register(registerDTO);
    }

    // Endpoint de connexion : POST /api/auth/login
    @PostMapping("/login")
    public UserDTO login(@RequestBody LoginDTO loginDTO) {
        return userService.login(loginDTO);
    }
}
=======
@Autowired
private AiMealService aiMealService;

@PostMapping("/login-init-meals")
public List<Recipe> loginAndInitMeals(@RequestParam String dietType) {
    return aiMealService.generateAndSavePersonalizedMeals(dietType);
}
}
>>>>>>> ccb12d7 (jout de l'ia)
