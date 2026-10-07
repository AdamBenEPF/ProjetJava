package com.squadz.back_app.DAO;

import com.squadz.back_app.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Connexion : retrouver le compte à partir de l'email saisi
    Optional<User> findByEmailIgnoreCase(String email);

    // Inscription : refuser un email déjà utilisé
    boolean existsByEmailIgnoreCase(String email);
}
