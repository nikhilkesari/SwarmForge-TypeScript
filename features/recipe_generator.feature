# mutation-stamp: sha256=7bd52217f8bc6787aeacd493de6ca432d1c23af0343d67cf72c641f8ea4e926a
# acceptance-mutation-manifest-begin
# {"version":1,"tested_at":"2026-07-19T10:34:10.478909Z","feature_name":"Indian Recipe Generator","feature_path":"features/recipe_generator.feature","background_hash":"cc5f0ff28380dd52820b6423456566f916f796018da886f9ffdcd22d1b9bdefc","implementation_hash":"sha256:b0b81706b2c672e4e9515d0190e2ee1d2dc4341923f0169dc2a055744be57ed0","scenarios":[{"index":0,"name":"Generate 5 Indian recipes from ingredient input","scenario_hash":"e43a9dd1dd0bc9293a53ee0dd9cb9a40efa1c7f716035c62a6a7ab10abbcaba0","mutation_count":4,"result":{"Total":4,"Killed":4,"Survived":0,"Errors":0},"tested_at":"2026-07-19T10:34:10.478909Z"}]}
# acceptance-mutation-manifest-end

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
