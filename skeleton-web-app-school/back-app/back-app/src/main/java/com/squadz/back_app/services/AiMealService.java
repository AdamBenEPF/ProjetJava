package com.squadz.back_app.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
<<<<<<< HEAD
import com.squadz.back_app.DAO.RecipeRepository;
import com.squadz.back_app.DTO.RecipeDetailsDTO;
import com.squadz.back_app.models.Recipe;
=======
import com.squadz.back_app.DTO.PersonalizedMealRequest;
import com.squadz.back_app.models.Ingredient;
import com.squadz.back_app.models.Recipe;
import com.squadz.back_app.models.RecipeIngredient;
import com.squadz.back_app.DAO.IngredientRepository;
import com.squadz.back_app.DAO.RecipeIngredientRepository;
import com.squadz.back_app.DAO.RecipeRepository;
>>>>>>> ccb12d7 (jout de l'ia)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
<<<<<<< HEAD
import org.springframework.web.server.ResponseStatusException;

=======
>>>>>>> ccb12d7 (jout de l'ia)
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiMealService {

    // Valeurs de meal_type utilisées en base (voir V2__insert_default_data.sql)
    private static final List<String> MEAL_TYPES = List.of("Breakfast", "Lunch", "Dinner");

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

<<<<<<< HEAD
    @Autowired
    private RecipeRepository recipeRepository;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Une proposition de recette avec ses ingrédients, NON enregistrée : le front l'affiche puis l'ajoute si validée
    public RecipeDetailsDTO generateMealSuggestion(String dietType, String mealType, String instructions) {
        String prompt = "Propose une recette de type " + mealType + " pour un régime " + dietType + "."
                + (instructions != null && !instructions.isBlank() ? " Consignes : " + instructions + "." : "")
                + " Réponds uniquement avec un objet JSON valide possédant exactement les clés :"
                + " titre, calories, proteines, glucides, lipides, ingredients."
                + " ingredients est un tableau d'objets avec les clés nom, quantite (nombre) et unite"
                + " (une valeur parmi : grammes, millilitres, pieces, cuilleres a soupe, cuilleres a cafe).";

        Map<String, Object> data = parseJson(askAi(prompt), new TypeReference<>() {});

        List<RecipeDetailsDTO.IngredientLine> ingredients = new ArrayList<>();
        if (data.get("ingredients") instanceof List<?> lines) {
            for (Object line : lines) {
                if (line instanceof Map<?, ?> ingredient && ingredient.get("nom") instanceof String name) {
                    ingredients.add(new RecipeDetailsDTO.IngredientLine(null, name,
                            (String) ingredient.get("unite"), toBigDecimal(ingredient.get("quantite"))));
                }
            }
=======
@Autowired
private IngredientRepository ingredientRepository;

@Autowired
private RecipeIngredientRepository recipeIngredientRepository;

private final WebClient webClient = WebClient.create();
private final ObjectMapper objectMapper = new ObjectMapper();

public Recipe generateAndSavePersonalizedMeal(PersonalizedMealRequest criteria) {
    if (criteria == null) {
        throw new IllegalArgumentException("Les critères nutritionnels sont obligatoires.");
    }

    String prompt = buildPersonalizedPrompt(criteria);
    Map<String, Object> requestBody = Map.of(
        "model", "openai/gpt-oss-20b",
        "messages", new Object[]{
            Map.of("role", "user", "content", prompt)
>>>>>>> ccb12d7 (jout de l'ia)
        }

<<<<<<< HEAD
        return new RecipeDetailsDTO(null, (String) data.get("titre"), mealType, dietType,
                toInteger(data.get("calories")), toDouble(data.get("proteines")),
                toDouble(data.get("glucides")), toDouble(data.get("lipides")), ingredients);
    }

    // 2. Une liste d'idées de plats, en texte brut (un plat par ligne)
    public String generateMultipleMeals(String dietType) {
        return askAi("Propose une liste de 10 plats différents pour un régime " + dietType
                + ". Réponds avec un plat par ligne, sans autre texte.");
    }

    // 3. Génère 20 recettes et les enregistre directement dans le catalogue
    public List<Recipe> generateAndSaveMultipleMeals(String dietType) {
        String prompt = "Propose une liste de 20 plats différents de type " + dietType + ". Réponds uniquement sous forme"
                + " de tableau JSON valide d'objets, où chaque objet possède exactement les clés : titre, typeRepas,"
                + " calories, proteines, glucides, lipides. typeRepas vaut Breakfast, Lunch ou Dinner.";

        List<Map<String, Object>> mealsData = parseJson(askAi(prompt), new TypeReference<>() {});

        List<Recipe> savedRecipes = new ArrayList<>();
        for (Map<String, Object> data : mealsData) {
            String mealType = MEAL_TYPES.contains(data.get("typeRepas")) ? (String) data.get("typeRepas") : "Lunch";
            Recipe recipe = new Recipe((String) data.get("titre"), mealType, dietType,
                    toInteger(data.get("calories")), toDouble(data.get("proteines")),
                    toDouble(data.get("glucides")), toDouble(data.get("lipides")));
            savedRecipes.add(recipeRepository.save(recipe));
        }
        return savedRecipes;
    }

    // Appel à l'API Groq (format OpenAI) : renvoie le texte de la réponse, sans les balises markdown
    @SuppressWarnings("unchecked")
    private String askAi(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Génération IA indisponible : la variable d'environnement GROQ_API_KEY n'est pas définie.");
        }

        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-20b",
                "messages", new Object[]{Map.of("role", "user", "content", prompt)}
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri(apiUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            var choices = (List<Map<String, Object>>) response.get("choices");
            var message = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) message.get("content");

            // Nettoyage au cas où l'IA ajoute des balises markdown autour du JSON
            return content.replaceAll("```json", "").replaceAll("```", "").trim();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Erreur lors de l'appel à l'IA : " + e.getMessage());
        }
    }

    private <T> T parseJson(String json, TypeReference<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "La réponse de l'IA est illisible, réessayez.");
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
}
=======
    String rawResponse = webClient.post()
        .uri(apiUrl + "/chat/completions")
        .header("Authorization", "Bearer " + apiKey)
        .header("Content-Type", "application/json")
        .bodyValue(requestBody)
        .retrieve()
        .bodyToMono(String.class)
        .block();

    if (rawResponse == null || rawResponse.isBlank()) {
        throw new IllegalStateException("La réponse de l'API Groq est vide.");
    }

    try {
        JsonNode response = objectMapper.readTree(rawResponse);
        JsonNode contentNode = response.path("choices").path(0).path("message").path("content");
        if (!contentNode.isTextual()) {
            throw new IllegalStateException("La réponse de l'API Groq ne contient pas de plat exploitable.");
        }

        String jsonContent = contentNode.asText()
                .replace("```json", "")
                .replace("```", "")
                .trim();
        JsonNode mealNode = objectMapper.readTree(jsonContent);
        if (!mealNode.isObject()) {
            throw new IllegalStateException("L'IA n'a pas renvoyé un objet de plat valide.");
        }
        return saveRecipeFromNode(mealNode, criteria);
    } catch (Exception e) {
        throw new IllegalStateException("Erreur lors de la génération du plat personnalisé : " + e.getMessage(), e);
    }
}

private String buildPersonalizedPrompt(PersonalizedMealRequest criteria) {
    StringBuilder prompt = new StringBuilder(
            "Génère UN SEUL plat personnalisé. Réponds uniquement avec un objet JSON valide, "
                    + "sans Markdown ni texte autour. Les clés obligatoires sont : titre, typeRepas, "
                    + "typeRegime, calories, proteines, glucides, lipides et ingredients. "
                    + "Chaque ingrédient doit contenir nom, quantite numérique et unite (g, kg, ml, cl, "
                    + "unité, pincée, cuillère à soupe ou cuillère à café)."
    );
    appendCriterion(prompt, "type de régime", criteria.getDietType());
    appendCriterion(prompt, "type de repas", criteria.getMealType());
    if (criteria.getTargetCalories() != null) {
        prompt.append(" Vise environ ").append(criteria.getTargetCalories()).append(" calories.");
    }
    if (criteria.getTargetProteins() != null) {
        prompt.append(" Vise environ ").append(criteria.getTargetProteins()).append(" g de protéines.");
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

private Recipe saveRecipeFromNode(JsonNode node, PersonalizedMealRequest criteria) {
    Recipe recipe = new Recipe();
    recipe.setTitle(node.path("titre").asText("Plat personnalisé"));
    recipe.setMealType(node.path("typeRepas").asText(criteria.getMealType() != null ? criteria.getMealType() : "Repas"));
    recipe.setDietType(node.path("typeRegime").asText(criteria.getDietType() != null ? criteria.getDietType() : "Tous"));
    recipe.setCalories(node.path("calories").asInt(0));
    recipe.setProteins(node.path("proteines").asDouble(0.0));
    recipe.setCarbs(node.path("glucides").asDouble(0.0));
    recipe.setFats(node.path("lipides").asDouble(0.0));

    Recipe savedRecipe = recipeRepository.save(recipe);
    JsonNode ingredients = node.path("ingredients");
    if (!ingredients.isArray()) {
        throw new IllegalStateException("Le plat généré ne contient pas de liste d'ingrédients.");
    }

    for (JsonNode ingredientNode : ingredients) {
        String name = ingredientNode.path("nom").asText("").trim();
        String unit = ingredientNode.path("unite").asText("").trim();
        if (name.isBlank() || unit.isBlank()) {
            throw new IllegalStateException("Chaque ingrédient doit avoir un nom et une unité.");
        }
        BigDecimal quantity = parseQuantity(ingredientNode.path("quantite"));
        Ingredient ingredient = ingredientRepository.findByName(name).orElseGet(() -> {
            Ingredient created = new Ingredient(name, unit);
            return ingredientRepository.save(created);
        });
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
    return savedRecipe;
}

private BigDecimal parseQuantity(JsonNode quantityNode) {
    if (quantityNode.isNumber()) {
        return quantityNode.decimalValue();
    }
    String value = quantityNode.asText("").replace(',', '.').trim();
    if (value.isBlank()) {
        throw new IllegalStateException("La quantité d'un ingrédient est obligatoire.");
    }
    return new BigDecimal(value);
}

public List<Recipe> generateAndSavePersonalizedMeals(String dietType) {
List<Recipe> allSavedRecipes = new ArrayList<>();

// On fait 2 appels de 10 plats pour atteindre 20 plats en évitant d'exploser le quota 429
for (int batch = 0; batch < 5; batch++) {
    try {
        String prompt = "Propose une liste de 4 plats variés de type " + dietType + ". Réponds STRICTEMENT sous forme de tableau JSON valide d'objets, sans texte autour, avec les clés : titre, typeRepas, typeRegime, calories, proteines, glucides, lipides, et un tableau 'ingredients' contenant des objets avec 'nom', 'quantite' et 'unite'.";

        Map<String, Object> requestBody = Map.of(
            "model", "openai/gpt-oss-20b",
            "messages", new Object[]{
                Map.of("role", "user", "content", prompt)
            }
        );

        String rawJsonResponse = webClient.post()
            .uri(apiUrl + "/chat/completions")
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        if (rawJsonResponse == null) continue;

        JsonNode rootApiResponse = objectMapper.readTree(rawJsonResponse);
        JsonNode contentNode = rootApiResponse.path("choices").path(0).path("message").path("content");
        
        if (!contentNode.isTextual()) continue;

        String jsonContent = contentNode.asText();
        jsonContent = jsonContent.replaceAll("```json", "").replaceAll("```", "").trim();

        if (!jsonContent.endsWith("]")) {
            int lastIndex = jsonContent.lastIndexOf("}");
            if (lastIndex != -1) {
                jsonContent = jsonContent.substring(0, lastIndex + 1) + "]";
            }
        }

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

                JsonNode ingArray = node.path("ingredients");
                if (ingArray.isArray()) {
                    for (JsonNode ingNode : ingArray) {
                        String nomIng = ingNode.path("nom").asText("Ingrédient");
                        String qteStr = ingNode.path("quantite").asText("1");
                        String unite = ingNode.path("unite").asText("unité");

                        BigDecimal qte = BigDecimal.ONE;
                        try {
                            qte = new BigDecimal(qteStr.replaceAll("[^0-9.,]", "").replace(',', '.').trim());
                        } catch (Exception ignored) {}

                        Ingredient ingredient = ingredientRepository.findByName(nomIng)
                                .orElseGet(() -> {
                                    Ingredient newIng = new Ingredient();
                                    newIng.setName(nomIng);
                                    newIng.setUnit(unite);
                                    return ingredientRepository.save(newIng);
                                });

                        RecipeIngredient recipeIngredient = new RecipeIngredient();
                        recipeIngredient.setRecipeId(savedRecipe.getId());
                        recipeIngredient.setIngredientId(ingredient.getId());
                        recipeIngredient.setQuantity(qte);
                        recipeIngredientRepository.save(recipeIngredient);
                    }
                }
            }
        }

        // Pause de 2 secondes entre chaque appel pour ne pas surcharger l'API (erreur 429)
        Thread.sleep(2000);

    } catch (Exception e) {
        System.err.println("Erreur sur un lot de génération : " + e.getMessage());
    }
}

return allSavedRecipes;
}
}
>>>>>>> ccb12d7 (jout de l'ia)
