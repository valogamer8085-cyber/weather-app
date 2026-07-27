import { fetchCitySuggestions } from './api.js';

export class SearchController {
  constructor(uiRenderer, onCitySelect, onGeoSelect) {
    this.ui = uiRenderer;
    this.onCitySelect = onCitySelect;
    this.onGeoSelect = onGeoSelect;

    this.searchInput = document.getElementById('search-input');
    this.dropdown = document.getElementById('autocomplete-dropdown');
    this.geoBtn = document.getElementById('geo-btn');

    this.debounceTimer = null;
    this.selectedIndex = -1;
    this.currentSuggestions = [];

    this.init();
  }

  init() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleInput(e.target.value));
      this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
      this.searchInput.addEventListener('focus', () => {
        if (this.currentSuggestions.length > 0) this.showDropdown();
      });
    }

    if (this.geoBtn) {
      this.geoBtn.addEventListener('click', () => this.handleGeolocation());
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideDropdown();
      }
    });
  }

  handleInput(value) {
    clearTimeout(this.debounceTimer);
    const query = value.trim();

    if (query.length < 2) {
      this.hideDropdown();
      return;
    }

    this.debounceTimer = setTimeout(async () => {
      const suggestions = await fetchCitySuggestions(query);
      this.currentSuggestions = suggestions;
      this.renderDropdown(suggestions);
    }, 250);
  }

  renderDropdown(suggestions) {
    if (!this.dropdown) return;
    this.dropdown.innerHTML = '';
    this.selectedIndex = -1;

    if (suggestions.length === 0) {
      this.hideDropdown();
      return;
    }

    suggestions.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.dataset.index = index;
      div.innerHTML = `
        <span class="autocomplete-city"><i class="fa-solid fa-location-dot" style="margin-right: 8px; color: var(--color-accent);"></i> ${item.name}</span>
        <span class="autocomplete-country">${item.country}</span>
      `;

      div.addEventListener('click', () => {
        this.selectItem(item);
      });

      this.dropdown.appendChild(div);
    });

    this.showDropdown();
  }

  handleKeyDown(e) {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length === 0) return;
      this.selectedIndex = (this.selectedIndex + 1) % items.length;
      this.updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length === 0) return;
      this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
      this.updateSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.selectedIndex >= 0 && this.currentSuggestions[this.selectedIndex]) {
        this.selectItem(this.currentSuggestions[this.selectedIndex]);
      } else if (this.searchInput.value.trim().length > 0) {
        this.onCitySelect(this.searchInput.value.trim());
        this.hideDropdown();
      }
    } else if (e.key === 'Escape') {
      this.hideDropdown();
    }
  }

  updateSelection(items) {
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
      if (index === this.selectedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  selectItem(item) {
    this.searchInput.value = `${item.name}, ${item.country}`;
    this.hideDropdown();

    if (item.lat && item.lon) {
      this.onGeoSelect({ lat: item.lat, lon: item.lon, name: item.name, country: item.country });
    } else {
      this.onCitySelect(item.name);
    }
  }

  handleGeolocation() {
    if (!navigator.geolocation) {
      this.ui.showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    this.ui.showToast('Requesting device location...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.onGeoSelect({ lat: latitude, lon: longitude });
        this.ui.showToast('Location updated from device GPS!', 'success');
      },
      (error) => {
        let msg = 'Failed to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please search for your city manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        this.ui.showToast(msg, 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  showDropdown() {
    if (this.dropdown) this.dropdown.classList.add('active');
  }

  hideDropdown() {
    if (this.dropdown) this.dropdown.classList.remove('active');
  }
}
