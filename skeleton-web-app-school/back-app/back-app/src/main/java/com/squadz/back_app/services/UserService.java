package com.squadz.back_app.services;

import com.squadz.back_app.models.User;
import com.squadz.back_app.DAO.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.squadz.back_app.DAO.UserRepository;
import com.squadz.back_app.DTO.LoginDTO;
import com.squadz.back_app.DTO.RegisterDTO;
import com.squadz.back_app.DTO.UserDTO;
import com.squadz.back_app.DTO.UserUpdateDTO;
import com.squadz.back_app.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

@Autowired
private UserDao userRepository;

public List<User> getAllUsers() {
    return userRepository.findAll();
}

public Optional<User> getUserById(Long id) {
    return userRepository.findById(id);
}

public User saveUser(User user) {
    return userRepository.save(user);
}

public void deleteUser(Long id) {
    userRepository.deleteById(id);
}
}

