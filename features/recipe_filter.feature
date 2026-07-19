# Feature: Recipe Filter
# Scenario: recipe_filter_1

Feature: Recipe Filtering
  As a cooking enthusiast with dietary restrictions
  I want to specify my dietary preference (Veg, Non-Veg, or All) before generating recipes
  So that the generated recipes match my selection, and I can filter them dynamically

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
  Scenario Outline: Filter already generated recipes dynamically
    When the user toggles the dietary filter to "All"
    And the user enters the search query "paneer, chicken"
    And the user submits the query
    Then the application displays exactly 5 recipes: "Butter Chicken, Palak Paneer, Chicken Biryani, Paneer Tikka, Chicken Curry"
    When the user toggles the dietary filter to <filter_diet>
    Then the application displays the filtered recipes: <filtered_recipes>
    And the active dietary filter remains <filter_diet>

    Examples:
      | filter_diet | filtered_recipes                                  |
      | "Veg"       | "Palak Paneer, Paneer Tikka"                      |
      | "Non-Veg"   | "Butter Chicken, Chicken Biryani, Chicken Curry" |

  # Scenario: recipe_filter_3
  Scenario Outline: Empty state when filtering generated list yields no matches
    When the user toggles the dietary filter to "All"
    And the user enters the search query "potato, cumin"
    And the user submits the query
    Then the application displays exactly 5 recipes: "Aloo Jeera, Aloo Gobi, Aloo Paratha, Dum Aloo, Aloo Methi"
    When the user toggles the dietary filter to <filter_diet>
    Then the application displays no recipes
    And the application displays the filter empty message <message>

    Examples:
      | filter_diet | message                                   |
      | "Non-Veg"   | "No recipes matching Non-Veg Only found." |

  # Scenario: recipe_filter_4
  Scenario Outline: Toggling dietary preference triggers automatic fetch if query is present
    Given the user enters the search query <query>
    When the user toggles the dietary filter to <diet>
    Then the application calls the recipe service for <diet> recipes with <query>
    And the application displays exactly 5 recipes: <recipes>
    And the active dietary filter remains <diet>

    Examples:
      | query             | diet      | recipes                                                                        |
      | "paneer, spinach" | "Veg"     | "Palak Paneer, Paneer Tikka, Paneer Bhurji, Kadai Paneer, Matar Paneer"        |
      | "chicken"         | "Non-Veg" | "Butter Chicken, Chicken Biryani, Chicken Tikka, Chicken Korma, Chicken Curry" |
