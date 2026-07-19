# Feature: Recipe Generator
# Scenario: recipe_generator_1

Feature: Indian Recipe Generator
  As a cooking enthusiast
  I want to generate Indian recipes based on my inputs
  So that I can cook delicious Indian dishes

  Background:
    Given the Indian Recipe Generator application is loaded

  # Scenario: recipe_generator_1
  Scenario Outline: Generate 5 Indian recipes from ingredient input
    When the user enters the search query <query>
    And the user submits the query
    Then the application calls the Google Gen AI SDK to fetch recipes
    And the application displays exactly 5 recipes: <recipes>
    And all recipes must belong to Indian cuisine

    Examples:
      | query             | recipes                                                                                |
      | "paneer, spinach" | "Palak Paneer, Paneer Tikka, Paneer Bhurji, Kadai Paneer, Matar Paneer"                |
      | "potato, cumin"   | "Aloo Jeera, Aloo Gobi, Aloo Paratha, Dum Aloo, Aloo Methi"                            |
