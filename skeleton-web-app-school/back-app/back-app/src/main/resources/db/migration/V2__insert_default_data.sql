INSERT INTO users (name, email, password, diet_preference)
VALUES
    ('Alice Martin', 'alice@example.com', 'password123', 'Vegetarian'),
    ('Thomas Bernard', 'thomas@example.com', 'password123', 'Omnivore')
ON CONFLICT (email) DO NOTHING;

INSERT INTO recipes (title, meal_type, diet_type, calories, proteins, carbs, fats)
SELECT data.title, data.meal_type, data.diet_type, data.calories, data.proteins, data.carbs, data.fats
FROM (VALUES
    ('Pasta primavera', 'Lunch', 'Vegetarian', 520, 18.0, 72.0, 16.0),
    ('Chicken rice bowl', 'Dinner', 'Omnivore', 640, 42.0, 68.0, 18.0),
    ('Overnight oats', 'Breakfast', 'Vegetarian', 380, 14.0, 55.0, 11.0)
) AS data(title, meal_type, diet_type, calories, proteins, carbs, fats)
WHERE NOT EXISTS (
    SELECT 1 FROM recipes r WHERE r.title = data.title
);

INSERT INTO ingredients (name, unit)
SELECT data.name, data.unit
FROM (VALUES
    ('Pasta', 'g'),
    ('Chicken breast', 'g'),
    ('Rice', 'g'),
    ('Tomato', 'unit'),
    ('Oats', 'g'),
    ('Milk', 'ml')
) AS data(name, unit)
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients i WHERE i.name = data.name
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, data.quantity
FROM (VALUES
    ('Pasta primavera', 'Pasta', 100.00),
    ('Pasta primavera', 'Tomato', 2.00),
    ('Chicken rice bowl', 'Chicken breast', 150.00),
    ('Chicken rice bowl', 'Rice', 100.00),
    ('Overnight oats', 'Oats', 60.00),
    ('Overnight oats', 'Milk', 200.00)
) AS data(recipe_title, ingredient_name, quantity)
JOIN recipes r ON r.title = data.recipe_title
JOIN ingredients i ON i.name = data.ingredient_name
ON CONFLICT (recipe_id, ingredient_id) DO NOTHING;

INSERT INTO meal_plans (user_id, recipe_id, date, moment_repas)
SELECT u.id, r.id, CURRENT_DATE, 'Lunch'
FROM users u
JOIN recipes r ON r.title = 'Pasta primavera'
WHERE u.email = 'alice@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM meal_plans mp
      WHERE mp.user_id = u.id
        AND mp.recipe_id = r.id
        AND mp.date = CURRENT_DATE
        AND mp.moment_repas = 'Lunch'
  );

INSERT INTO shopping_lists (user_id, date_generation)
SELECT id, CURRENT_TIMESTAMP
FROM users
WHERE email = 'alice@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM shopping_lists sl
      WHERE sl.user_id = users.id
  );
