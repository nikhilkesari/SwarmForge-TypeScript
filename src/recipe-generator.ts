import { RecipeService, isVegRecipe } from './recipe-service';

// Basic Component Interface
interface Component {
  render(): HTMLElement;
}

// 1. Header Component
export class HeaderComponent implements Component {
  render(): HTMLElement {
    const header = document.createElement('header');
    header.innerHTML = `
      <h1>Indian Recipe Generator</h1>
      <p>Discover delicious authentic Indian recipes from your ingredients</p>
    `;
    return header;
  }
}

// 2. SearchForm Component
export class SearchFormComponent implements Component {
  private onSubmitCallback: (query: string) => void;
  private submitButton!: HTMLButtonElement;
  private buttonLoader!: HTMLElement;

  constructor(onSubmit: (query: string) => void) {
    this.onSubmitCallback = onSubmit;
  }

  render(): HTMLElement {
    const form = document.createElement('form');
    form.id = 'search-form';
    form.innerHTML = `
      <div class="input-wrapper">
        <input 
          type="text" 
          id="search-input" 
          placeholder="e.g., paneer, spinach" 
          required 
          autocomplete="off"
        />
        <button type="submit" id="submit-button">
          <span>Generate</span>
          <div class="loader" id="button-loader" style="display: none;"></div>
        </button>
      </div>
    `;

    this.submitButton = form.querySelector('#submit-button') as HTMLButtonElement;
    this.buttonLoader = form.querySelector('#button-loader') as HTMLElement;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('#search-input') as HTMLInputElement;
      const query = input.value.trim();
      if (query) {
        this.onSubmitCallback(query);
      }
    });

    return form;
  }

  setLoading(isLoading: boolean) {
    if (this.submitButton && this.buttonLoader) {
      this.submitButton.disabled = isLoading;
      this.buttonLoader.style.display = isLoading ? 'inline-block' : 'none';
    }
  }
}

// 3. DietToggle Component
export class DietToggleComponent implements Component {
  private onToggleCallback: (diet: string) => void;
  private buttons: HTMLButtonElement[] = [];

  constructor(onToggle: (diet: string) => void) {
    this.onToggleCallback = onToggle;
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'diet-toggle-container';

    const diets = [
      { key: 'All', label: 'All' },
      { key: 'Veg', label: 'Veg Only' },
      { key: 'Non-Veg', label: 'Non-Veg Only' }
    ];

    diets.forEach((diet, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'diet-toggle-btn' + (idx === 0 ? ' active' : '');
      btn.setAttribute('data-diet', diet.key);
      btn.textContent = diet.label;
      btn.addEventListener('click', () => {
        this.buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.onToggleCallback(diet.key);
      });
      this.buttons.push(btn);
      container.appendChild(btn);
    });

    return container;
  }

  setFilter(diet: string) {
    this.buttons.forEach(btn => {
      if (btn.getAttribute('data-diet') === diet) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

// 4. RecipeItem Component
export class RecipeItemComponent implements Component {
  private name: string;
  private index: number;
  private onSelectCallback: (recipe: string) => void;

  constructor(name: string, index: number, onSelect: (recipe: string) => void) {
    this.name = name;
    this.index = index;
    this.onSelectCallback = onSelect;
  }

  render(): HTMLElement {
    const li = document.createElement('li');
    li.className = 'recipe-item';
    li.style.animationDelay = `${this.index * 0.1}s`;

    const numSpan = document.createElement('span');
    numSpan.className = 'recipe-num';
    numSpan.textContent = `0${this.index + 1}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'recipe-name';
    nameSpan.textContent = this.name;

    const btn = document.createElement('button');
    btn.className = 'get-recipe-btn';
    btn.setAttribute('data-recipe', this.name);
    btn.textContent = 'Get Recipe';
    btn.addEventListener('click', () => this.onSelectCallback(this.name));

    li.appendChild(numSpan);
    li.appendChild(nameSpan);
    li.appendChild(btn);

    return li;
  }
}

// 5. RecipeListComponent Component
export class RecipeListComponent implements Component {
  private onSelectRecipeCallback: (recipe: string) => void;
  private container!: HTMLElement;
  private listElement!: HTMLUListElement;
  private filterEmptyMsg!: HTMLElement;

  constructor(onSelectRecipe: (recipe: string) => void) {
    this.onSelectRecipeCallback = onSelectRecipe;
  }

  render(): HTMLElement {
    this.container = document.createElement('div');
    this.container.id = 'results-section';
    this.container.style.display = 'none';

    const header = document.createElement('div');
    header.className = 'results-header';
    header.innerHTML = `<h2>Your Recipes</h2>`;

    this.listElement = document.createElement('ul');
    this.listElement.id = 'recipes-list';

    this.filterEmptyMsg = document.createElement('div');
    this.filterEmptyMsg.id = 'filter-empty-message';
    this.filterEmptyMsg.className = 'status-message info';
    this.filterEmptyMsg.style.display = 'none';

    this.container.appendChild(header);
    this.container.appendChild(this.listElement);
    this.container.appendChild(this.filterEmptyMsg);

    return this.container;
  }

  update(recipes: string[], currentFilter: string) {
    this.listElement.innerHTML = '';
    this.filterEmptyMsg.style.display = 'none';
    this.filterEmptyMsg.textContent = '';

    const filtered = recipes.filter(recipe => {
      if (currentFilter === 'Veg') return isVegRecipe(recipe);
      if (currentFilter === 'Non-Veg') return !isVegRecipe(recipe);
      return true;
    });

    if (filtered.length === 0) {
      const displayFilter = currentFilter === 'All' ? 'All' : `${currentFilter} Only`;
      this.filterEmptyMsg.textContent = `No recipes matching ${displayFilter} found.`;
      this.filterEmptyMsg.style.display = 'block';
    }

    filtered.forEach((recipe, idx) => {
      const itemComponent = new RecipeItemComponent(recipe, idx, this.onSelectRecipeCallback);
      this.listElement.appendChild(itemComponent.render());
    });

    this.container.style.display = 'block';
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

// 6. RecipeDetailsComponent Component
export class RecipeDetailsComponent implements Component {
  private container!: HTMLElement;
  private titleElement!: HTMLElement;
  private contentElement!: HTMLElement;

  render(): HTMLElement {
    this.container = document.createElement('div');
    this.container.id = 'recipe-details-section';
    this.container.className = 'status-message info';
    this.container.style.display = 'none';
    this.container.style.marginTop = '20px';
    this.container.style.textAlign = 'left';

    this.titleElement = document.createElement('h3');
    this.titleElement.id = 'recipe-details-title';
    this.titleElement.style.marginTop = '0';

    this.contentElement = document.createElement('p');
    this.contentElement.id = 'recipe-details-content';
    this.contentElement.style.marginBottom = '0';

    this.container.appendChild(this.titleElement);
    this.container.appendChild(this.contentElement);

    return this.container;
  }

  showFetching(recipeName: string) {
    this.titleElement.textContent = `${recipeName} Details`;
    this.contentElement.textContent = 'Fetching recipe instructions...';
    this.container.style.display = 'block';
  }

  showDetails(details: string) {
    this.contentElement.textContent = details;
  }

  showError() {
    this.contentElement.textContent = 'Failed to load recipe details. Please try again.';
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

// Main application component
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
