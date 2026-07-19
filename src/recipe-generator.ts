import { RecipeService } from './recipe-service';
import { HeaderComponent, SearchFormComponent, DietToggleComponent, RecipeDetailsComponent } from './recipe-components';
import { RecipeListComponent } from './recipe-list-components';

export class IndianRecipeGeneratorApp {
  private service: RecipeService;
  private container: HTMLElement;
  private currentRecipes: string[] = [];
  private currentFilter = 'All';
  private lastSubmittedQuery = '';

  // Component references
  private searchForm!: SearchFormComponent;
  private dietToggle!: DietToggleComponent;
  private recipeList!: RecipeListComponent;
  private recipeDetails!: RecipeDetailsComponent;
  private statusMsg!: HTMLElement;

  constructor(container: HTMLElement, service: RecipeService) {
    this.container = container;
    this.service = service;
  }

  init() {
    this.container.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'app-card';

    // Render static header
    const header = new HeaderComponent();
    card.appendChild(header.render());

    const main = document.createElement('main');

    // Instantiate and render components
    this.searchForm = new SearchFormComponent((query) => this.handleFetch(query));
    main.appendChild(this.searchForm.render());

    this.dietToggle = new DietToggleComponent((diet) => this.handleDietToggle(diet));
    main.appendChild(this.dietToggle.render());

    // Status Message element
    this.statusMsg = document.createElement('div');
    this.statusMsg.id = 'status-message';
    this.statusMsg.className = 'status-message';
    this.statusMsg.style.display = 'none';
    main.appendChild(this.statusMsg);

    this.recipeList = new RecipeListComponent((recipe) => this.handleSelectRecipe(recipe));
    main.appendChild(this.recipeList.render());

    this.recipeDetails = new RecipeDetailsComponent();
    main.appendChild(this.recipeDetails.render());

    card.appendChild(main);
    this.container.appendChild(card);
  }

  private async handleFetch(query: string) {
    this.searchForm.setLoading(true);
    this.statusMsg.style.display = 'block';
    this.statusMsg.className = 'status-message info';
    this.statusMsg.textContent = 'Consulting the culinary oracle...';
    this.recipeList.hide();
    this.recipeDetails.hide();

    try {
      this.currentRecipes = await this.service.getRecipes(query, this.currentFilter);
      this.lastSubmittedQuery = query;
      
      this.statusMsg.style.display = 'none';
      this.recipeList.update(this.currentRecipes, this.currentFilter);
    } catch (error) {
      this.statusMsg.className = 'status-message error';
      this.statusMsg.textContent = 'Oops! Failed to retrieve recipes. Please try again.';
    } finally {
      this.searchForm.setLoading(false);
    }
  }

  private async handleDietToggle(newDiet: string) {
    this.currentFilter = newDiet;
    
    // Retrieve query from search input element
    const input = this.container.querySelector('#search-input') as HTMLInputElement;
    const query = input ? input.value.trim() : '';

    if (query) {
      await this.handleFetch(query);
    } else {
      this.recipeList.update(this.currentRecipes, this.currentFilter);
    }
  }

  private async handleSelectRecipe(recipeName: string) {
    this.recipeDetails.showFetching(recipeName);

    try {
      const details = await this.service.getRecipeDetails(recipeName);
      this.recipeDetails.showDetails(details);
    } catch (err) {
      this.recipeDetails.showError();
    }
  }
}
