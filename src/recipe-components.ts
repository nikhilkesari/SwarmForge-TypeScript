export interface Component {
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

// 4. RecipeDetailsComponent Component
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
