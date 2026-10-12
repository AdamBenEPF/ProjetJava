package com.squadz.back_app.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.squadz.back_app.DAO.IngredientRepository;
import com.squadz.back_app.DAO.RecipeIngredientRepository;
import com.squadz.back_app.DAO.RecipeRepository;
import com.squadz.back_app.DTO.PersonalizedMealRequest;
import com.squadz.back_app.DTO.RecipeDetailsDTO;
import com.squadz.back_app.models.Ingredient;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.models.RecipeIngredient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiMealService {

    private static final List<String> MEAL_TYPES = List.of("Breakfast", "Lunch", "Dinner");

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private RecipeIngredientRepository recipeIngredientRepository;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RecipeDetailsDTO generateMealSuggestion(String dietType, String mealType, String instructions) {
        String prompt = "Propose une recette de type " + mealType + " pour un régime " + dietType + "."
                + (instructions != null && !instructions.isBlank() ? " Consignes : " + instructions + "." : "")
                + " Réponds uniquement avec un objet JSON valide possédant exactement les clés : "
                + "titre, calories, proteines, glucides, lipides, ingredients. "
                + "Chaque ingrédient doit contenir nom, quantite (nombre) et unite.";

        Map<String, Object> data = parseJson(askAi(prompt), new TypeReference<>() {});
        List<RecipeDetailsDTO.IngredientLine> ingredients = new ArrayList<>();
        if (data.get("ingredients") instanceof List<?> lines) {
            for (Object line : lines) {
                if (line instanceof Map<?, ?> ingredient && ingredient.get("nom") instanceof String name) {
                    ingredients.add(new RecipeDetailsDTO.IngredientLine(
                            null, name, String.valueOf(ingredient.get("unite")),
                            toBigDecimal(ingredient.get("quantite"))));
                }
            }
        }
        return new RecipeDetailsDTO(null, (String) data.get("titre"), mealType, dietType,
                toInteger(data.get("calories")), toDouble(data.get("proteines")),
                toDouble(data.get("glucides")), toDouble(data.get("lipides")), ingredients);
    }

    public String generateMultipleMeals(String dietType) {
        return askAi("Propose une liste de 10 plats différents pour un régime " + dietType
                + ". Réponds avec un plat par ligne, sans autre texte.");
    }

    public List<Recipe> generateAndSaveMultipleMeals(String dietType) {
        String prompt = "Propose une liste de 20 plats différents de type " + dietType
                + ". Réponds uniquement sous forme de tableau JSON valide d'objets, "
                + "avec les clés titre, typeRepas, calories, proteines, glucides, lipides.";
        List<Map<String, Object>> mealsData = parseJson(askAi(prompt), new TypeReference<>() {});
        List<Recipe> savedRecipes = new ArrayList<>();
        for (Map<String, Object> data : mealsData) {
            String mealType = MEAL_TYPES.contains(data.get("typeRepas"))
                    ? (String) data.get("typeRepas") : "Lunch";
            Recipe recipe = new Recipe((String) data.get("titre"), mealType, dietType,
                    toInteger(data.get("calories")), toDouble(data.get("proteines")),
                    toDouble(data.get("glucides")), toDouble(data.get("lipides")));
            savedRecipes.add(recipeRepository.save(recipe));
        }
        return savedRecipes;
    }

    public List<Recipe> generateAndSavePersonalizedMeals(String dietType) {
        List<Recipe> allSavedRecipes = new ArrayList<>();

        for (int batch = 0; batch < 4; batch++) {
            try {
                String prompt = "Propose une liste exacte de 5 plats variés de type " + dietType
                        + ". Réponds STRICTEMENT sous forme de tableau JSON valide d'objets, sans texte autour, "
                        + "avec les clés : titre, typeRepas, typeRegime, calories, proteines, glucides, lipides, "
                        + "et un tableau 'ingredients' contenant des objets avec 'nom', 'quantite' et 'unite'.";

                Map<String, Object> requestBody = Map.of(
                        "model", "openai/gpt-oss-20b",
                        "messages", new Object[]{
                                Map.of("role", "user", "content", prompt)
                        });

                String rawJsonResponse = webClient.post()
                        .uri(apiUrl + "/chat/completions")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                if (rawJsonResponse == null || rawJsonResponse.isBlank()) {
                    continue;
                }

                JsonNode rootApiResponse = objectMapper.readTree(rawJsonResponse);
                JsonNode contentNode = rootApiResponse.path("choices").path(0)
                        .path("message").path("content");
                if (!contentNode.isTextual()) {
                    continue;
                }

                String jsonContent = contentNode.asText()
                        .replace("```json", "")
                        .replace("```", "")
                        .trim();
                JsonNode rootNode = objectMapper.readTree(jsonContent);

                if (rootNode.isArray()) {
                    for (JsonNode node : rootNode) {
                        Recipe recipe = new Recipe();
                        recipe.setTitle(node.path("titre").asText("Recette"));
                        recipe.setMealType(node.path("typeRepas").asText("Repas"));
                        recipe.setDietType(node.path("typeRegime").asText(dietType));
                        recipe.setCalories(node.path("calories").asInt(0));
                        recipe.setProteins(node.path("proteines").asDouble(0.0));
                        recipe.setCarbs(node.path("glucides").asDouble(0.0));
                        recipe.setFats(node.path("lipides").asDouble(0.0));

                        Recipe savedRecipe = recipeRepository.save(recipe);
                        allSavedRecipes.add(savedRecipe);

                        JsonNode ingredients = node.path("ingredients");
                        if (ingredients.isArray()) {
                            for (JsonNode ingredientNode : ingredients) {
                                String name = ingredientNode.path("nom").asText("Ingrédient");
                                String unit = ingredientNode.path("unite").asText("unité");
                                BigDecimal quantity = parseQuantity(ingredientNode.path("quantite"));

                                Ingredient ingredient = ingredientRepository.findByName(name)
                                        .orElseGet(() -> ingredientRepository.save(new Ingredient(name, unit)));
                                if (!unit.equals(ingredient.getUnit())) {
                                    ingredient.setUnit(unit);
                                    ingredient = ingredientRepository.save(ingredient);
                                }

                                RecipeIngredient link = new RecipeIngredient();
                                link.setRecipeId(savedRecipe.getId());
                                link.setIngredientId(ingredient.getId());
                                link.setQuantity(quantity);
                                recipeIngredientRepository.save(link);
                            }
                        }
                    }
                }

                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("La génération des recettes a été interrompue.", e);
            } catch (Exception e) {
                System.err.println("Erreur sur un lot de génération : " + e.getMessage());
            }
        }

        return allSavedRecipes;
    }

    public Recipe generateAndSavePersonalizedMeal(PersonalizedMealRequest criteria) {
        if (criteria == null) {
            throw new IllegalArgumentException("Les critères nutritionnels sont obligatoires.");
        }
        String prompt = buildPersonalizedPrompt(criteria);
        JsonNode response = parseJson(askAi(prompt), new TypeReference<>() {});
        if (!response.isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "La réponse de l'IA est invalide.");
        }

        Recipe recipe = new Recipe();
        recipe.setTitle(response.path("titre").asText("Plat personnalisé"));
        recipe.setMealType(response.path("typeRepas").asText(
                criteria.getMealType() != null ? criteria.getMealType() : "Lunch"));
        recipe.setDietType(response.path("typeRegime").asText(
                criteria.getDietType() != null ? criteria.getDietType() : "Tous"));
        recipe.setCalories(response.path("calories").asInt(0));
        recipe.setProteins(response.path("proteines").asDouble(0));
        recipe.setCarbs(response.path("glucides").asDouble(0));
        recipe.setFats(response.path("lipides").asDouble(0));
        Recipe savedRecipe = recipeRepository.save(recipe);

        JsonNode ingredients = response.path("ingredients");
        if (!ingredients.isArray()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Le plat généré ne contient pas d'ingrédients.");
        }
        for (JsonNode node : ingredients) {
            String name = node.path("nom").asText("").trim();
            String unit = node.path("unite").asText("").trim();
            if (name.isBlank() || unit.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Chaque ingrédient doit avoir un nom et une unité.");
            }
            Ingredient ingredient = ingredientRepository.findByName(name).orElseGet(
                    () -> ingredientRepository.save(new Ingredient(name, unit)));
            if (!unit.equals(ingredient.getUnit())) {
                ingredient.setUnit(unit);
                ingredient = ingredientRepository.save(ingredient);
            }
            RecipeIngredient link = new RecipeIngredient();
            link.setRecipeId(savedRecipe.getId());
            link.setIngredientId(ingredient.getId());
            link.setQuantity(parseQuantity(node.path("quantite")));
            recipeIngredientRepository.save(link);
        }
        return savedRecipe;
    }

    private String buildPersonalizedPrompt(PersonalizedMealRequest criteria) {
        StringBuilder prompt = new StringBuilder(
                "Génère un seul plat. Réponds uniquement avec un objet JSON valide contenant "
                        + "titre, typeRepas, typeRegime, calories, proteines, glucides, lipides et "
                        + "ingredients. Chaque ingrédient doit contenir nom, quantite numérique et unite.");
        appendCriterion(prompt, "régime", criteria.getDietType());
        appendCriterion(prompt, "type de repas", criteria.getMealType());
        if (criteria.getTargetCalories() != null) {
            prompt.append(" Calories ciblées : ").append(criteria.getTargetCalories()).append(".");
        }
        if (criteria.getTargetProteins() != null) {
            prompt.append(" Protéines ciblées : ").append(criteria.getTargetProteins()).append(" g.");
        }
        appendCriterion(prompt, "ingrédient obligatoire", criteria.getMandatoryIngredient());
        appendCriterion(prompt, "préférences", criteria.getPreferences());
        return prompt.toString();
    }

    private void appendCriterion(StringBuilder prompt, String label, String value) {
        if (value != null && !value.isBlank()) {
            prompt.append(" ").append(label).append(" : ").append(value.trim()).append(".");
        }
    }

    private String askAi(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "La variable GROQ_API_KEY n'est pas définie.");
        }
        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-20b",
                "messages", new Object[]{Map.of("role", "user", "content", prompt)});
        try {
            String response = webClient.post().uri(apiUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody).retrieve().bodyToMono(String.class).block();
            JsonNode root = objectMapper.readTree(response);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (!content.isTextual()) {
                throw new IllegalStateException("Réponse IA sans contenu.");
            }
            return content.asText().replace("```json", "").replace("```", "").trim();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erreur lors de l'appel à l'IA : " + e.getMessage(), e);
        }
    }

    private <T> T parseJson(String json, TypeReference<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "La réponse de l'IA est illisible.", e);
        }
    }

    private static Integer toInteger(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private static Double toDouble(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    private static BigDecimal toBigDecimal(Object value) {
        return value instanceof Number number ? new BigDecimal(number.toString()) : BigDecimal.ONE;
    }

    private static BigDecimal parseQuantity(JsonNode node) {
        if (node.isNumber()) {
            return node.decimalValue();
        }
        String value = node.asText("").replace(',', '.').trim();
        if (value.isBlank()) {
            throw new IllegalArgumentException("Quantité d'ingrédient obligatoire.");
        }
        return new BigDecimal(value);
    }
}
