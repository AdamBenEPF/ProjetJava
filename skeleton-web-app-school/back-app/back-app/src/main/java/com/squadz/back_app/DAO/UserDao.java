package com.squadz.back_app.DAO;

import com.squadz.back_app.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserDao extends JpaRepository<User, Long> {
Optional findByEmail(String email);
}