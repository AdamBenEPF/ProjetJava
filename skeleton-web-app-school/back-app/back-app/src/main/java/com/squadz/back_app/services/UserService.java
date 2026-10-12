package com.squadz.back_app.services;

import com.squadz.back_app.DAO.UserDao;
import com.squadz.back_app.DAO.UserRepository;
import com.squadz.back_app.DTO.LoginDTO;
import com.squadz.back_app.DTO.RegisterDTO;
import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.DTO.UserUpdateDTO;
import com.squadz.back_app.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserDao userDao;
    private final UserRepository userRepository;

    public UserService(UserDao userDao, UserRepository userRepository) {
        this.userDao = userDao;
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userDao.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userDao.findById(id);
    }

    public User saveUser(User user) {
        return userDao.save(user);
    }

    public void deleteUser(Long id) {
        userDao.deleteById(id);
    }

    public UserDTO register(RegisterDTO request) {
        if (request == null || request.email() == null || request.password() == null
                || request.name() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les champs d'inscription sont obligatoires.");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé.");
        }
        User user = new User(request.name(), request.email(), request.password(), request.dietPreference());
        return UserDTO.from(userRepository.save(user));
    }

    public UserDTO login(LoginDTO request) {
        if (request == null || request.email() == null || request.password() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email et mot de passe obligatoires.");
        }
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .filter(candidate -> candidate.getPassword().equals(request.password()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect."));
        return UserDTO.from(user);
    }

    public UserDTO update(Long id, UserUpdateDTO request) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if (request.dietPreference() != null) {
            user.setDietPreference(request.dietPreference().trim());
        }
        return UserDTO.from(userDao.save(user));
    }
}
