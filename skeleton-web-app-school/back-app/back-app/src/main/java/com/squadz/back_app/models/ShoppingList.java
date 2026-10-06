package com.squadz.back_app.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shopping_lists")
public class ShoppingList {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(name = "user_id", nullable = false)
private Long userId;

@Column(name = "date_generation")
private LocalDateTime dateGeneration;

public ShoppingList() {}

public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public Long getUserId() { return userId; }
public void setUserId(Long userId) { this.userId = userId; }

public LocalDateTime getDateGeneration() { return dateGeneration; }
public void setDateGeneration(LocalDateTime dateGeneration) { this.dateGeneration = dateGeneration; }
}