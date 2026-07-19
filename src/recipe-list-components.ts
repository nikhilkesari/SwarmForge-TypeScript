import { Component } from './recipe-components';
import { isVegRecipe } from './recipe-service';

// 1. RecipeItem Component
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

// 2. RecipeListComponent Component
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
