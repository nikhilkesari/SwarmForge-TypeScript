# Feature: Recipe Filter
# Scenario: recipe_filter_1

Feature: Recipe Filtering
  As a cooking enthusiast with dietary restrictions
  I want to filter the generated recipes by Veg and Non-Veg
  So that I only see recipes that match my diet

  Background:
    Given the Indian Recipe Generator application is loaded

  # Scenario: recipe_filter_1
  Scenario Outline: Filter generated recipes by diet
    When the user enters the search query <query>
    And the user submits the query
    Then the application displays exactly 5 recipes: <recipes>
    When the user toggles the dietary filter to <diet>
    Then the application displays the filtered recipes: <filtered_recipes>

    Examples:
      | query             | recipes                                                                                | diet      | filtered_recipes                                  |
      | "paneer, chicken" | "Butter Chicken, Palak Paneer, Chicken Biryani, Paneer Tikka, Chicken Curry"           | "Veg"     | "Palak Paneer, Paneer Tikka"                      |
      | "paneer, chicken" | "Butter Chicken, Palak Paneer, Chicken Biryani, Paneer Tikka, Chicken Curry"           | "Non-Veg" | "Butter Chicken, Chicken Biryani, Chicken Curry" |
