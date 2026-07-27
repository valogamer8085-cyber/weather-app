/**
 * Weather & Area Customization Option System Controller
 * Handles Region/State Presets, Weather Condition Switcher, and Custom Weather Studio
 */

export class WeatherOptionsController {
  constructor(uiRenderer, app) {
    this.ui = uiRenderer;
    this.app = app;
    this.activeCondition = null;
    this.customWeatherActive = false;

    // Region, State & Continent Presets (All Continents, 50 US States, 36 Indian States & UTs, World Nations)
    this.regionPresets = {
      "🌍 7 Continents": [
        { name: "Africa (Cairo, Egypt)", query: "Cairo, Egypt" },
        { name: "Antarctica (McMurdo Station)", query: "McMurdo Station, Antarctica" },
        { name: "Asia (Tokyo, Japan)", query: "Tokyo, Japan" },
        { name: "Europe (London, UK)", query: "London, UK" },
        { name: "North America (New York, USA)", query: "New York, USA" },
        { name: "Oceania (Sydney, Australia)", query: "Sydney, Australia" },
        { name: "South America (São Paulo, Brazil)", query: "Sao Paulo, Brazil" }
      ],
      "🇺🇸 US States (All 50 States)": [
        { name: "Alabama", query: "Alabama, USA" },
        { name: "Alaska", query: "Alaska, USA" },
        { name: "Arizona", query: "Arizona, USA" },
        { name: "Arkansas", query: "Arkansas, USA" },
        { name: "California", query: "California, USA" },
        { name: "Colorado", query: "Colorado, USA" },
        { name: "Connecticut", query: "Connecticut, USA" },
        { name: "Delaware", query: "Delaware, USA" },
        { name: "Florida", query: "Florida, USA" },
        { name: "Georgia", query: "Georgia, USA" },
        { name: "Hawaii", query: "Hawaii, USA" },
        { name: "Idaho", query: "Idaho, USA" },
        { name: "Illinois", query: "Illinois, USA" },
        { name: "Indiana", query: "Indiana, USA" },
        { name: "Iowa", query: "Iowa, USA" },
        { name: "Kansas", query: "Kansas, USA" },
        { name: "Kentucky", query: "Kentucky, USA" },
        { name: "Louisiana", query: "Louisiana, USA" },
        { name: "Maine", query: "Maine, USA" },
        { name: "Maryland", query: "Maryland, USA" },
        { name: "Massachusetts", query: "Massachusetts, USA" },
        { name: "Michigan", query: "Michigan, USA" },
        { name: "Minnesota", query: "Minnesota, USA" },
        { name: "Mississippi", query: "Mississippi, USA" },
        { name: "Missouri", query: "Missouri, USA" },
        { name: "Montana", query: "Montana, USA" },
        { name: "Nebraska", query: "Nebraska, USA" },
        { name: "Nevada", query: "Nevada, USA" },
        { name: "New Hampshire", query: "New Hampshire, USA" },
        { name: "New Jersey", query: "New Jersey, USA" },
        { name: "New Mexico", query: "New Mexico, USA" },
        { name: "New York", query: "New York, USA" },
        { name: "North Carolina", query: "North Carolina, USA" },
        { name: "North Dakota", query: "North Dakota, USA" },
        { name: "Ohio", query: "Ohio, USA" },
        { name: "Oklahoma", query: "Oklahoma, USA" },
        { name: "Oregon", query: "Oregon, USA" },
        { name: "Pennsylvania", query: "Pennsylvania, USA" },
        { name: "Rhode Island", query: "Rhode Island, USA" },
        { name: "South Carolina", query: "South Carolina, USA" },
        { name: "South Dakota", query: "South Dakota, USA" },
        { name: "Tennessee", query: "Tennessee, USA" },
        { name: "Texas", query: "Texas, USA" },
        { name: "Utah", query: "Utah, USA" },
        { name: "Vermont", query: "Vermont, USA" },
        { name: "Virginia", query: "Virginia, USA" },
        { name: "Washington", query: "Washington, USA" },
        { name: "West Virginia", query: "West Virginia, USA" },
        { name: "Wisconsin", query: "Wisconsin, USA" },
        { name: "Wyoming", query: "Wyoming, USA" }
      ],
      "🇮🇳 Indian States & Union Territories": [
        { name: "Andhra Pradesh (Visakhapatnam)", query: "Visakhapatnam, India" },
        { name: "Arunachal Pradesh (Itanagar)", query: "Itanagar, India" },
        { name: "Assam (Guwahati)", query: "Guwahati, India" },
        { name: "Bihar (Patna)", query: "Patna, India" },
        { name: "Chhattisgarh (Raipur)", query: "Raipur, India" },
        { name: "Delhi NCR", query: "Delhi, India" },
        { name: "Goa (Panaji)", query: "Panaji, India" },
        { name: "Gujarat (Ahmedabad)", query: "Ahmedabad, India" },
        { name: "Haryana (Gurugram)", query: "Gurugram, India" },
        { name: "Himachal Pradesh (Shimla)", query: "Shimla, India" },
        { name: "Jammu & Kashmir (Srinagar)", query: "Srinagar, India" },
        { name: "Jharkhand (Ranchi)", query: "Ranchi, India" },
        { name: "Karnataka (Bengaluru)", query: "Bengaluru, India" },
        { name: "Kerala (Thiruvananthapuram)", query: "Thiruvananthapuram, India" },
        { name: "Ladakh (Leh)", query: "Leh, India" },
        { name: "Madhya Pradesh (Bhopal)", query: "Bhopal, India" },
        { name: "Maharashtra (Mumbai)", query: "Mumbai, India" },
        { name: "Manipur (Imphal)", query: "Imphal, India" },
        { name: "Meghalaya (Shillong)", query: "Shillong, India" },
        { name: "Mizoram (Aizawl)", query: "Aizawl, India" },
        { name: "Nagaland (Kohima)", query: "Kohima, India" },
        { name: "Odisha (Bhubaneswar)", query: "Bhubaneswar, India" },
        { name: "Punjab (Chandigarh)", query: "Chandigarh, India" },
        { name: "Rajasthan (Jaipur)", query: "Jaipur, India" },
        { name: "Sikkim (Gangtok)", query: "Gangtok, India" },
        { name: "Tamil Nadu (Chennai)", query: "Chennai, India" },
        { name: "Telangana (Hyderabad)", query: "Hyderabad, India" },
        { name: "Tripura (Agartala)", query: "Agartala, India" },
        { name: "Uttar Pradesh (Lucknow)", query: "Lucknow, India" },
        { name: "Uttarakhand (Dehradun)", query: "Dehradun, India" },
        { name: "West Bengal (Kolkata)", query: "Kolkata, India" }
      ],
      "🇨🇦 Canadian & 🇦🇺 Australian States": [
        { name: "Ontario, Canada", query: "Toronto, Canada" },
        { name: "Quebec, Canada", query: "Montreal, Canada" },
        { name: "British Columbia, Canada", query: "Vancouver, Canada" },
        { name: "Alberta, Canada", query: "Calgary, Canada" },
        { name: "New South Wales, Australia", query: "Sydney, Australia" },
        { name: "Victoria, Australia", query: "Melbourne, Australia" },
        { name: "Queensland, Australia", query: "Brisbane, Australia" },
        { name: "Western Australia", query: "Perth, Australia" },
        { name: "South Australia", query: "Adelaide, Australia" }
      ],
      "🇪🇺 European Nations": [
        { name: "United Kingdom (London)", query: "London, UK" },
        { name: "France (Paris)", query: "Paris, France" },
        { name: "Germany (Berlin)", query: "Berlin, Germany" },
        { name: "Italy (Rome)", query: "Rome, Italy" },
        { name: "Spain (Madrid)", query: "Madrid, Spain" },
        { name: "Netherlands (Amsterdam)", query: "Amsterdam, Netherlands" },
        { name: "Switzerland (Zurich)", query: "Zurich, Switzerland" },
        { name: "Austria (Vienna)", query: "Vienna, Austria" },
        { name: "Sweden (Stockholm)", query: "Stockholm, Sweden" },
        { name: "Norway (Oslo)", query: "Oslo, Norway" },
        { name: "Greece (Athens)", query: "Athens, Greece" },
        { name: "Ireland (Dublin)", query: "Dublin, Ireland" }
      ],
      "🌏 Asia & Middle East": [
        { name: "Japan (Tokyo)", query: "Tokyo, Japan" },
        { name: "China (Beijing)", query: "Beijing, China" },
        { name: "South Korea (Seoul)", query: "Seoul, South Korea" },
        { name: "Singapore", query: "Singapore" },
        { name: "Thailand (Bangkok)", query: "Bangkok, Thailand" },
        { name: "UAE (Dubai)", query: "Dubai, UAE" },
        { name: "Saudi Arabia (Riyadh)", query: "Riyadh, Saudi Arabia" },
        { name: "Turkey (Istanbul)", query: "Istanbul, Turkey" }
      ],
      "🌍 Africa & South America": [
        { name: "Egypt (Cairo)", query: "Cairo, Egypt" },
        { name: "South Africa (Johannesburg)", query: "Johannesburg, South Africa" },
        { name: "Kenya (Nairobi)", query: "Nairobi, Kenya" },
        { name: "Nigeria (Lagos)", query: "Lagos, Nigeria" },
        { name: "Brazil (São Paulo)", query: "Sao Paulo, Brazil" },
        { name: "Argentina (Buenos Aires)", query: "Buenos Aires, Argentina" },
        { name: "Colombia (Bogotá)", query: "Bogota, Colombia" },
        { name: "Peru (Lima)", query: "Lima, Peru" }
      ]
    };

    // Preset Weather Profiles
    this.weatherProfiles = {
      Clear: {
        conditionText: "Sunny & Clear",
        condition: "Clear",
        icon: "sun",
        temp: 26,
        humidity: 45,
        windSpeed: 12,
        uvIndex: 7,
        aqi: 1,
        aqiLevel: "Good",
        advice: "Ideal outdoor weather. Perfect solar conditions."
      },
      Rain: {
        conditionText: "Heavy Rain Showers",
        condition: "Rain",
        icon: "cloud-rain",
        temp: 16,
        humidity: 88,
        windSpeed: 24,
        uvIndex: 2,
        aqi: 2,
        aqiLevel: "Moderate",
        advice: "Carry an umbrella. Wet roads and low visibility."
      },
      Snow: {
        conditionText: "Blizzard & Heavy Snow",
        condition: "Snow",
        icon: "snowflake",
        temp: -4,
        humidity: 92,
        windSpeed: 30,
        uvIndex: 1,
        aqi: 1,
        aqiLevel: "Good",
        advice: "Freezing temperatures. Bundle up with thermal layers."
      },
      Thunderstorm: {
        conditionText: "Severe Thunderstorm",
        condition: "Thunderstorm",
        icon: "cloud-lightning",
        temp: 19,
        humidity: 94,
        windSpeed: 42,
        uvIndex: 1,
        aqi: 3,
        aqiLevel: "Moderate",
        advice: "Lightning risk. Stay indoors and secure loose objects."
      },
      Clouds: {
        conditionText: "Overcast & Cloudy",
        condition: "Clouds",
        icon: "cloud",
        temp: 21,
        humidity: 65,
        windSpeed: 15,
        uvIndex: 4,
        aqi: 2,
        aqiLevel: "Fair",
        advice: "Mild conditions with full cloud coverage."
      },
      Fog: {
        conditionText: "Thick Smog & Fog",
        condition: "Fog",
        icon: "cloud-fog",
        temp: 14,
        humidity: 96,
        windSpeed: 6,
        uvIndex: 1,
        aqi: 4,
        aqiLevel: "Unhealthy",
        advice: "Hazardous visibility. Use anti-pollution mask."
      }
    };

    this.init();
  }

  init() {
    this.renderRegionDropdown();
    this.bindEvents();
  }

  renderRegionDropdown() {
    const select = document.getElementById('region-state-select');
    if (!select) return;

    select.innerHTML = '<option value="">🌐 Select State / Region Preset...</option>';

    for (const [groupName, locations] of Object.entries(this.regionPresets)) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = groupName;

      locations.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.query;
        opt.textContent = loc.name;
        optgroup.appendChild(opt);
      });

      select.appendChild(optgroup);
    }
  }

  bindEvents() {
    // Region Select Dropdown
    const select = document.getElementById('region-state-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          this.app.loadWeather(val);
          select.value = ''; // Reset select placeholder
        }
      });
    }

    // Weather Condition Switcher Pills
    const pills = document.querySelectorAll('.weather-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const condition = pill.dataset.condition;
        this.setActivePill(pill);
        this.applyWeatherCondition(condition);
      });
    });

    // Reset Custom Weather Button
    const resetBtn = document.getElementById('reset-weather-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.clearActivePills();
        if (this.app.lastQuery) {
          this.app.loadWeather(this.app.lastQuery);
        } else {
          this.app.loadWeather('Tokyo');
        }
        this.ui.showToast('Reset to Live Weather API data', 'info');
      });
    }

    // Custom Weather Studio Modal Controls
    const studioOpenBtn = document.getElementById('open-studio-btn');
    const studioModal = document.getElementById('weather-studio-modal');
    const studioCloseBtn = document.getElementById('close-studio-btn');
    const studioForm = document.getElementById('weather-studio-form');

    if (studioOpenBtn && studioModal) {
      studioOpenBtn.addEventListener('click', () => {
        this.populateStudioForm();
        studioModal.classList.add('active');
      });
    }

    if (studioCloseBtn && studioModal) {
      studioCloseBtn.addEventListener('click', () => {
        studioModal.classList.remove('active');
      });
    }

    if (studioForm) {
      // Sync Range Sliders Display
      const tempRange = document.getElementById('studio-temp');
      const tempValue = document.getElementById('studio-temp-val');
      if (tempRange && tempValue) {
        tempRange.addEventListener('input', () => {
          tempValue.textContent = `${tempRange.value}°C`;
        });
      }

      const windRange = document.getElementById('studio-wind');
      const windValue = document.getElementById('studio-wind-val');
      if (windRange && windValue) {
        windRange.addEventListener('input', () => {
          windValue.textContent = `${windRange.value} km/h`;
        });
      }

      const humidityRange = document.getElementById('studio-humidity');
      const humidityValue = document.getElementById('studio-humidity-val');
      if (humidityRange && humidityValue) {
        humidityRange.addEventListener('input', () => {
          humidityValue.textContent = `${humidityRange.value}%`;
        });
      }

      // Form Submit
      studioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyCustomStudioWeather();
        if (studioModal) studioModal.classList.remove('active');
      });
    }
  }

  setActivePill(activePill) {
    document.querySelectorAll('.weather-pill').forEach(p => p.classList.remove('active'));
    if (activePill) activePill.classList.add('active');
  }

  clearActivePills() {
    document.querySelectorAll('.weather-pill').forEach(p => p.classList.remove('active'));
  }

  applyWeatherCondition(conditionKey) {
    const profile = this.weatherProfiles[conditionKey];
    if (!profile || !this.ui.currentData) return;

    // Create a modified copy of current weather data with simulated condition profile
    const currentData = JSON.parse(JSON.stringify(this.ui.currentData));
    
    currentData.isCustom = true;
    currentData.customLabel = `Simulated ${conditionKey}`;
    currentData.current.condition = profile.condition;
    currentData.current.conditionText = profile.conditionText;
    currentData.current.icon = profile.icon;
    currentData.current.temp = profile.temp;
    currentData.current.feelsLike = profile.temp - 1;
    currentData.current.humidity = profile.humidity;
    currentData.current.windSpeed = profile.windSpeed;
    currentData.current.uvIndex = profile.uvIndex;

    // Update Air Quality
    currentData.airQuality.aqi = profile.aqi;
    currentData.airQuality.level = profile.aqiLevel;
    currentData.airQuality.advice = profile.advice;

    // Update Hourly Temps based on new temp
    const tempDiff = profile.temp - this.ui.currentData.current.temp;
    currentData.hourly.forEach(h => {
      h.temp = Math.round(h.temp + tempDiff);
      h.icon = profile.icon;
    });

    // Update Daily Temps
    currentData.daily.forEach(d => {
      d.maxTemp = Math.round(d.maxTemp + tempDiff);
      d.minTemp = Math.round(d.minTemp + tempDiff);
      d.icon = profile.icon;
    });

    // Render transformed data
    this.ui.renderAll(currentData);
    this.ui.showToast(`Switched weather condition to: ${profile.conditionText}`, 'success');
  }

  populateStudioForm() {
    if (!this.ui.currentData) return;
    const current = this.ui.currentData.current;

    const condSelect = document.getElementById('studio-condition');
    if (condSelect) condSelect.value = current.condition || 'Clear';

    const tempRange = document.getElementById('studio-temp');
    const tempVal = document.getElementById('studio-temp-val');
    if (tempRange && tempVal) {
      tempRange.value = current.temp || 22;
      tempVal.textContent = `${tempRange.value}°C`;
    }

    const windRange = document.getElementById('studio-wind');
    const windVal = document.getElementById('studio-wind-val');
    if (windRange && windVal) {
      windRange.value = current.windSpeed || 15;
      windVal.textContent = `${windRange.value} km/h`;
    }

    const humidityRange = document.getElementById('studio-humidity');
    const humidityVal = document.getElementById('studio-humidity-val');
    if (humidityRange && humidityVal) {
      humidityRange.value = current.humidity || 50;
      humidityVal.textContent = `${humidityRange.value}%`;
    }

    const uvInput = document.getElementById('studio-uv');
    if (uvInput) uvInput.value = current.uvIndex || 5;

    const areaInput = document.getElementById('studio-area-name');
    if (areaInput) areaInput.value = this.ui.currentData.location?.name || '';
  }

  applyCustomStudioWeather() {
    if (!this.ui.currentData) return;

    const condSelect = document.getElementById('studio-condition');
    const tempRange = document.getElementById('studio-temp');
    const windRange = document.getElementById('studio-wind');
    const humidityRange = document.getElementById('studio-humidity');
    const uvInput = document.getElementById('studio-uv');
    const areaInput = document.getElementById('studio-area-name');

    const conditionKey = condSelect ? condSelect.value : 'Clear';
    const profile = this.weatherProfiles[conditionKey] || this.weatherProfiles['Clear'];

    const customTemp = tempRange ? parseInt(tempRange.value, 10) : profile.temp;
    const customWind = windRange ? parseInt(windRange.value, 10) : profile.windSpeed;
    const customHumidity = humidityRange ? parseInt(humidityRange.value, 10) : profile.humidity;
    const customUV = uvInput ? parseInt(uvInput.value, 10) : profile.uvIndex;
    const customArea = areaInput && areaInput.value.trim() ? areaInput.value.trim() : this.ui.currentData.location.name;

    const currentData = JSON.parse(JSON.stringify(this.ui.currentData));

    currentData.isCustom = true;
    currentData.customLabel = 'Custom Studio Mode';
    currentData.location.name = customArea;
    currentData.current.condition = conditionKey;
    currentData.current.conditionText = profile.conditionText;
    currentData.current.icon = profile.icon;
    currentData.current.temp = customTemp;
    currentData.current.feelsLike = customTemp - 2;
    currentData.current.humidity = customHumidity;
    currentData.current.windSpeed = customWind;
    currentData.current.uvIndex = customUV;

    const tempDiff = customTemp - this.ui.currentData.current.temp;
    currentData.hourly.forEach(h => {
      h.temp = Math.round(h.temp + tempDiff);
      h.icon = profile.icon;
    });

    currentData.daily.forEach(d => {
      d.maxTemp = Math.round(d.maxTemp + tempDiff);
      d.minTemp = Math.round(d.minTemp + tempDiff);
      d.icon = profile.icon;
    });

    this.ui.renderAll(currentData);
    this.ui.showToast(`Applied Custom Weather for ${customArea}!`, 'success');
  }
}
