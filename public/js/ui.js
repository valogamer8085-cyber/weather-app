import { renderHourlyCurve } from './hourlyChart.js';

export class UIRenderer {
  constructor() {
    this.unit = localStorage.getItem('weather_unit') || 'C'; // 'C' or 'F'
    this.favorites = JSON.parse(localStorage.getItem('weather_favorites') || '["Tokyo", "New York", "London", "Sydney"]');
    this.currentData = null;

    // Toast Container Reference
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  }

  setUnit(unit) {
    this.unit = unit;
    localStorage.setItem('weather_unit', unit);
    if (this.currentData) {
      this.renderAll(this.currentData);
    }
  }

  toggleFavorite(cityName) {
    if (!cityName) return;
    const index = this.favorites.indexOf(cityName);
    if (index >= 0) {
      this.favorites.splice(index, 1);
      this.showToast(`Removed ${cityName} from favorites.`, 'info');
    } else {
      this.favorites.push(cityName);
      this.showToast(`Added ${cityName} to favorites!`, 'success');
    }
    localStorage.setItem('weather_favorites', JSON.stringify(this.favorites));
    this.renderFavoritesChips(this.currentData?.location?.name);
    this.updateFavButtonState(cityName);
  }

  updateFavButtonState(cityName) {
    const btn = document.getElementById('fav-toggle-btn');
    if (!btn) return;
    const isFav = this.favorites.includes(cityName);
    btn.innerHTML = isFav ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
    btn.classList.toggle('is-fav', isFav);
  }

  renderFavoritesChips(activeCityName) {
    const container = document.getElementById('favorites-bar');
    if (!container) return;

    container.innerHTML = '';
    this.favorites.forEach(city => {
      const chip = document.createElement('button');
      chip.className = `favorite-chip ${city.toLowerCase() === activeCityName?.toLowerCase() ? 'active' : ''}`;
      chip.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${city}`;
      chip.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('city-select', { detail: city }));
      });
      container.appendChild(chip);
    });
  }

  convertTemp(tempC) {
    if (this.unit === 'F') {
      return Math.round((tempC * 9/5) + 32);
    }
    return Math.round(tempC);
  }

  formatWind(speedKph) {
    if (this.unit === 'F') {
      return `${Math.round(speedKph * 0.621371)} mph`;
    }
    return `${Math.round(speedKph)} km/h`;
  }

  getIconClass(iconCode) {
    const map = {
      'sun': 'fa-solid fa-sun text-amber-400',
      'moon': 'fa-solid fa-moon text-indigo-300',
      'cloud-sun': 'fa-solid fa-cloud-sun text-amber-300',
      'cloud': 'fa-solid fa-cloud text-slate-300',
      'cloud-rain': 'fa-solid fa-cloud-showers-heavy text-sky-400',
      'cloud-lightning': 'fa-solid fa-cloud-bolt text-purple-400',
      'snowflake': 'fa-solid fa-snowflake text-sky-200',
      'cloud-fog': 'fa-solid fa-smog text-slate-400'
    };
    return map[iconCode] || 'fa-solid fa-cloud-sun';
  }

  showSkeleton() {
    document.querySelectorAll('.skeleton-target').forEach(el => el.classList.add('skeleton'));
  }

  hideSkeleton() {
    document.querySelectorAll('.skeleton-target').forEach(el => el.classList.remove('skeleton'));
  }

  renderAll(data) {
    this.currentData = data;
    this.hideSkeleton();

    const { location, current, airQuality, hourly, daily, isMock, isCustom, customLabel } = data;

    // Render Hero Card
    document.getElementById('location-name').textContent = location.country ? `${location.name}, ${location.country}` : location.name;
    document.getElementById('mode-badge').textContent = isCustom ? (customLabel || 'Custom Simulation') : (isMock ? 'Mock Fallback Engine' : 'Live Weather API');
    document.getElementById('current-temp').textContent = this.convertTemp(current.temp);
    document.getElementById('temp-unit-label').textContent = `°${this.unit}`;
    document.getElementById('condition-text').textContent = current.conditionText;
    document.getElementById('feels-like-text').textContent = `Feels like ${this.convertTemp(current.feelsLike)}°${this.unit} • H: ${this.convertTemp(current.tempMax)}° L: ${this.convertTemp(current.tempMin)}°`;

    // Condition Icon
    const conditionIconContainer = document.getElementById('hero-condition-icon');
    if (conditionIconContainer) {
      conditionIconContainer.className = `condition-icon-badge ${this.getIconClass(current.icon)}`;
    }

    // Hero Footer Metrics
    document.getElementById('hero-humidity').textContent = `${current.humidity}%`;
    document.getElementById('hero-wind').textContent = `${this.formatWind(current.windSpeed)} ${current.windDirection || ''}`;
    document.getElementById('hero-pressure').textContent = `${current.pressure} hPa`;
    document.getElementById('hero-uv').textContent = `UV ${current.uvIndex}`;

    // Update Favorite Star
    this.updateFavButtonState(location.name);
    this.renderFavoritesChips(location.name);

    // Render 24-Hour Hourly Forecast
    this.renderHourly(hourly);

    // Render 7-Day Daily Forecast
    this.renderDaily(daily);

    // Render Matrix Metrics (AQI, UV, Wind, Solar Arc)
    this.renderMetrics(current, airQuality);

    // Dispatch weather change event for Canvas particle engine
    window.dispatchEvent(new CustomEvent('weather-change', { detail: current.condition }));
  }

  renderHourly(hourlyData) {
    const container = document.getElementById('hourly-scroll-container');
    if (!container) return;

    container.innerHTML = '';
    hourlyData.forEach(item => {
      const card = document.createElement('div');
      card.className = 'hourly-item';
      card.innerHTML = `
        <span class="hourly-time">${item.time}</span>
        <i class="${this.getIconClass(item.icon)} hourly-icon"></i>
        <span class="hourly-temp">${this.convertTemp(item.temp)}°</span>
        <span class="hourly-precip"><i class="fa-solid fa-droplet"></i> ${item.precipChance}%</span>
      `;
      container.appendChild(card);
    });

    // Render Bezier Canvas Chart
    renderHourlyCurve('hourly-canvas', hourlyData, this.unit);
  }

  renderDaily(dailyData) {
    const container = document.getElementById('daily-list');
    if (!container) return;

    container.innerHTML = '';

    // Calculate absolute min and max temp across 7 days for relative bar filling
    const minGlobal = Math.min(...dailyData.map(d => d.minTemp));
    const maxGlobal = Math.max(...dailyData.map(d => d.maxTemp));
    const rangeGlobal = maxGlobal - minGlobal || 1;

    dailyData.forEach(d => {
      const item = document.createElement('div');
      item.className = 'daily-item';

      const leftPct = ((d.minTemp - minGlobal) / rangeGlobal) * 100;
      const widthPct = Math.max(15, ((d.maxTemp - d.minTemp) / rangeGlobal) * 100);

      item.innerHTML = `
        <div class="daily-day-info">
          <span class="daily-day-name">${d.day}</span>
          <span class="daily-date">${d.date}</span>
        </div>
        <i class="${this.getIconClass(d.icon)} daily-icon"></i>
        <div class="daily-temp-bar-container">
          <span class="daily-temp-min">${this.convertTemp(d.minTemp)}°</span>
          <div class="daily-temp-bar">
            <div class="daily-temp-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
          </div>
          <span class="daily-temp-max">${this.convertTemp(d.maxTemp)}°</span>
        </div>
        <div class="daily-precip-badge">
          ${d.precipChance > 0 ? `<i class="fa-solid fa-droplet"></i> ${d.precipChance}%` : ''}
        </div>
      `;
      container.appendChild(item);
    });
  }

  renderMetrics(current, airQuality) {
    // Air Quality Index
    document.getElementById('aqi-value').textContent = airQuality.aqi;
    document.getElementById('aqi-level').textContent = airQuality.level;
    document.getElementById('aqi-level').style.color = airQuality.color;
    document.getElementById('aqi-advice').textContent = airQuality.advice;
    const aqiFill = document.getElementById('aqi-bar-fill');
    if (aqiFill) {
      aqiFill.style.width = `${(airQuality.aqi / 5) * 100}%`;
      aqiFill.style.backgroundColor = airQuality.color;
    }

    // UV Index
    document.getElementById('uv-value').textContent = current.uvIndex;
    const uvAdvice = current.uvIndex >= 6 ? 'High UV - Wear sunscreen & sunglasses' : 'Low to moderate solar radiation';
    document.getElementById('uv-advice').textContent = uvAdvice;
    const uvFill = document.getElementById('uv-bar-fill');
    if (uvFill) {
      uvFill.style.width = `${Math.min(100, (current.uvIndex / 11) * 100)}%`;
    }

    // Wind & Gust
    document.getElementById('wind-value').textContent = this.formatWind(current.windSpeed);
    document.getElementById('wind-direction').textContent = `Direction: ${current.windDirection || 'N/A'} (${current.windDeg || 0}°)`;

    // Humidity & Dew Point
    document.getElementById('humidity-value').textContent = `${current.humidity}%`;
    document.getElementById('dew-point').textContent = `Dew point is ${this.convertTemp(current.dewPoint || current.temp - 5)}°`;

    // Solar Arc
    document.getElementById('sunrise-time').textContent = current.solar?.sunrise || '06:15 AM';
    document.getElementById('sunset-time').textContent = current.solar?.sunset || '08:30 PM';
    const sunArcProgress = document.getElementById('sun-arc-fill');
    if (sunArcProgress) {
      sunArcProgress.style.width = `${current.solar?.progressPct || 50}%`;
    }

    // Atmospheric Pressure
    document.getElementById('pressure-value').textContent = `${current.pressure} hPa`;
    document.getElementById('visibility-value').textContent = `Visibility: ${current.visibility || 10} km`;
  }

  showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
      info: 'fa-solid fa-circle-info text-sky-400',
      success: 'fa-solid fa-circle-check text-emerald-400',
      warning: 'fa-solid fa-triangle-exclamation text-amber-400',
      error: 'fa-solid fa-circle-exclamation text-rose-400'
    };

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="${iconMap[type] || iconMap.info}"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }
}
