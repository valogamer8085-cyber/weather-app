import { fetchWeather } from './api.js';
import { UIRenderer } from './ui.js';
import { SearchController } from './search.js';
import { WeatherCanvasEngine } from './weatherCanvas.js';
import { WeatherOptionsController } from './weatherOptions.js';

class WeatherApp {
  constructor() {
    this.ui = new UIRenderer();
    this.canvasEngine = new WeatherCanvasEngine('weather-canvas');
    this.search = new SearchController(
      this.ui,
      (city) => this.loadWeather(city),
      (coords) => this.loadWeather(coords)
    );

    this.options = new WeatherOptionsController(this.ui, this);
    this.lastQuery = null;

    this.init();
  }

  init() {
    this.bindEvents();

    // Default location (Use last searched or default to Tokyo)
    const initialLocation = localStorage.getItem('last_weather_location') || 'Tokyo';
    this.loadWeather(initialLocation);
  }

  bindEvents() {
    // Unit Toggler (°C / °F)
    const btnC = document.getElementById('unit-c');
    const btnF = document.getElementById('unit-f');

    if (btnC && btnF) {
      btnC.addEventListener('click', () => {
        btnC.classList.add('active');
        btnF.classList.remove('active');
        this.ui.setUnit('C');
      });

      btnF.addEventListener('click', () => {
        btnF.classList.add('active');
        btnC.classList.remove('active');
        this.ui.setUnit('F');
      });

      // Set initial active state based on stored unit
      if (this.ui.unit === 'F') {
        btnF.classList.add('active');
        btnC.classList.remove('active');
      }
    }

    // Favorite Button Click
    const favBtn = document.getElementById('fav-toggle-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        if (this.ui.currentData?.location?.name) {
          this.ui.toggleFavorite(this.ui.currentData.location.name);
        }
      });
    }

    // Custom Event for City Selection from Favorite Chips
    window.addEventListener('city-select', (e) => {
      this.loadWeather(e.detail);
    });

    // Custom Event for Weather Canvas Condition Change
    window.addEventListener('weather-change', (e) => {
      this.canvasEngine.setCondition(e.detail);
    });

    // Window Resize & Orientation Change Handler for Aspect Ratio Switching (Mobile & Computer)
    const handleAspectResize = () => {
      if (this.canvasEngine) {
        this.canvasEngine.resizeCanvas();
      }
      if (this.ui.currentData?.hourly) {
        this.ui.renderHourly(this.ui.currentData.hourly);
      }
    };

    window.addEventListener('resize', handleAspectResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleAspectResize, 150);
    });
  }

  async loadWeather(queryOrCoords) {
    this.ui.showSkeleton();
    if (this.options) this.options.clearActivePills();

    try {
      const data = await fetchWeather(queryOrCoords);
      this.ui.renderAll(data);

      if (typeof queryOrCoords === 'string') {
        this.lastQuery = queryOrCoords;
        localStorage.setItem('last_weather_location', queryOrCoords);
      } else if (data.location?.name) {
        this.lastQuery = data.location.name;
        localStorage.setItem('last_weather_location', data.location.name);
      }
    } catch (err) {
      this.ui.hideSkeleton();
      this.ui.showToast(`Unable to load weather: ${err.message}`, 'error');
    }
  }
}

// Bootstrap application on DOMReady
document.addEventListener('DOMContentLoaded', () => {
  window.app = new WeatherApp();
});
