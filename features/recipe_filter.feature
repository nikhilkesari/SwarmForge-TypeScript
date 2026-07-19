# Feature: Recipe Filter
# Scenario: recipe_filter_1

Feature: Recipe Filtering
  As a cooking enthusiast with dietary restrictions
  I want to specify my dietary preference (Veg, Non-Veg, or All)
  So that the generated recipes match my selection, and toggling diet triggers new fetches

  Background:
    Given the Indian Recipe Generator application is loaded

  # Scenario: recipe_filter_1
  Scenario Outline: Generate recipes matching the selected dietary preference
    When the user toggles the dietary filter to <diet>
    And the user enters the search query <query>
    And the user submits the query
    Then the application calls the recipe service for <diet> recipes with <query>
    And the application displays exactly 5 recipes: <recipes>
    And the active dietary filter remains <diet>

    Examples:
      | diet      | query             | recipes                                                                                |
      | "Veg"     | "paneer, spinach" | "Palak Paneer, Paneer Tikka, Paneer Bhurji, Kadai Paneer, Matar Paneer"                |
      | "Non-Veg" | "chicken"         | "Butter Chicken, Chicken Biryani, Chicken Tikka, Chicken Korma, Chicken Curry"         |
      | "All"     | "paneer, chicken" | "Butter Chicken, Palak Paneer, Chicken Biryani, Paneer Tikka, Chicken Curry"           |

  # Scenario: recipe_filter_2
  Scenario Outline: Toggling dietary preference triggers automatic fetch if query is present
    Given the user enters the search query <query>
    And the user toggles the dietary filter to <initial_diet>
    And the user submits the query
    Then the application displays exactly 5 recipes: <initial_recipes>
    When the user toggles the dietary filter to <new_diet>
    Then the application calls the recipe service for <new_diet> recipes with <query>
    And the application displays exactly 5 recipes: <new_recipes>
    And the active dietary filter remains <new_diet>

    Examples:
      | query             | initial_diet | initial_recipes                                                                        | new_diet  | new_recipes                                                                            |
      | "paneer, chicken" | "Veg"        | "Palak Paneer, Paneer Tikka, Paneer Bhurji, Kadai Paneer, Matar Paneer"                | "All"     | "Butter Chicken, Palak Paneer, Chicken Biryani, Paneer Tikka, Chicken Curry"           |
      | "chicken"         | "All"        | "Butter Chicken, Chana Masala, Biryani, Dal Makhani, Samosa"                           | "Non-Veg" | "Butter Chicken, Chicken Biryani, Chicken Tikka, Chicken Korma, Chicken Curry"         |

  # Scenario: recipe_filter_3
  Scenario Outline: Empty state when fetching for a diet yields no matches
    Given the user enters the search query <query>
    And the user toggles the dietary filter to "All"
    And the user submits the query
    Then the application displays exactly 5 recipes: <initial_recipes>
    When the user toggles the dietary filter to <new_diet>
    Then the application displays no recipes
    And the application displays the filter empty message <message>
    And the active dietary filter remains <new_diet>

    Examples:
      | query             | initial_recipes                                             | new_diet  | message                                   |
      | "potato, cumin"   | "Aloo Jeera, Aloo Gobi, Aloo Paratha, Dum Aloo, Aloo Methi" | "Non-Veg" | "No recipes matching Non-Veg Only found." |
      | "chicken"         | "Butter Chicken, Chana Masala, Biryani, Dal Makhani, Samosa"| "Veg"     | "No recipes matching Veg Only found."     |
