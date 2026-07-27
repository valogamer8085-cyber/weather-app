# 🌤️ Aether Weather Forecasting Application

A modern, responsive, full-stack weather forecasting web application built with **Node.js, Express, HTML5, Vanilla CSS (Glassmorphism), and 60 FPS HTML5 Canvas particle FX**.

![Weather App Overview](https://raw.githubusercontent.com/placeholder/weather-preview.png)

## ✨ Key Features

- 🔍 **City & Zip Location Search**: Debounced auto-complete suggestions dropdown with full keyboard navigation (Up / Down / Enter / Esc).
- 📍 **Dynamic Geofencing**: One-click device GPS geolocation (`navigator.geolocation`) with permission status alerts.
- 🎨 **Glassmorphism Aesthetic**: Translucent frosted-glass cards with blur filters, subtle border highlights, tactile active depth (`transform: scale(0.97)`), and smooth hover states.
- 🌊 **60 FPS Animated Canvas FX Background**: Particle physics rendering dynamic weather scenes:
  - 🌧️ **Rain**: Velocity droplets with ground splash ripples.
  - ❄️ **Snow**: Swirling floating snowflakes.
  - ☁️ **Clouds**: Volumetric moving cloud puffs.
  - ☀️ **Solar Rays**: Shimmering solar lens flare.
  - ⚡ **Thunderstorm**: Electric lightning flash bursts.
- 📈 **24-Hour Visual Temperature Curve**: Smooth cubic Bezier spline graph drawn on HTML5 canvas with gradient fills and precipitation chance.
- 📅 **7-Day Daily Forecast**: Daily forecast list with interactive relative min/max temperature range bars.
- 📊 **Detailed Weather Matrix**:
  - Air Quality Index (AQI 1-5 rating, PM2.5, PM10, O3, health recommendations).
  - UV Index indicator gauge & advice.
  - Wind speed & compass direction angle.
  - Humidity & dew point.
  - Sunrise / Sunset solar progress arc.
  - Atmospheric pressure & visibility.
- 🌡️ **Unit Switcher**: Toggle effortlessly between Metric (°C, km/h) and Imperial (°F, mph).
- ⭐ **Favorite Cities**: Quick location chips saved in `localStorage`.
- ⚡ **Robust Mock Fallback Engine**: Works out of the box with zero configuration! If no external API key is provided, the backend generates hyper-realistic mock weather data for any global query.

---

## 🏗️ Tech Stack

- **Backend**: Node.js & Express REST API
- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties Design System), ES6 Modules
- **Canvas Physics**: Custom HTML5 Canvas Particle Engine (60 FPS)
- **Icons**: FontAwesome 6
- **Typography**: Google Fonts (Outfit & Inter)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Installation
Clone or navigate to the project directory and install dependencies:

```bash
npm install
```

### 2. Configuration (Optional)
Copy `.env.example` to `.env` if you want to use live data from OpenWeatherMap or WeatherAPI.com:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000

# Optional: Add your OpenWeatherMap API key or WeatherAPI key
OPENWEATHER_API_KEY=your_openweather_key_here
# OR
WEATHERAPI_KEY=your_weatherapi_key_here
```

*Note: If no API key is provided, the application automatically activates its high-fidelity Mock Fallback Engine.*

### 3. Run the Application

#### Production Mode:
```bash
npm start
```

#### Development Mode:
```bash
npm run dev
```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 📡 API Endpoints

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/weather` | `GET` | `q` (city name) OR `lat` & `lon` | Fetch current weather, 24-hr hourly, 7-day forecast, AQI, and UV data |
| `/api/weather/search` | `GET` | `q` (partial query string) | Auto-complete city suggestions |
| `/api/health` | `GET` | None | Healthcheck endpoint & API mode status (`live-api` vs `mock-fallback`) |

---

## 📁 File Structure

```
proj 1/
├── package.json
├── .env.example
├── README.md
├── server/
│   ├── app.js                   # Express server entry point & static file server
│   ├── routes/
│   │   └── weather.js           # API route handlers (/api/weather, /api/weather/search)
│   ├── services/
│   │   ├── weatherService.js    # Live API adapter & fallback router
│   │   └── mockWeatherData.js   # Realistic mock weather payload generator
│   └── utils/
│       └── errorHandler.js      # Centralized Express error handler
└── public/
    ├── index.html               # Main SPA HTML structure
    ├── css/
    │   ├── variables.css        # Color tokens, themes, fonts, design system
    │   ├── glassmorphism.css    # Frosted glass styling, skeletons, toasts
    │   └── styles.css           # Grid layout, cards, hero, responsive queries
    └── js/
        ├── app.js               # Application bootstrap & event binding
        ├── weatherCanvas.js     # 60 FPS HTML5 Canvas particle FX engine
        ├── hourlyChart.js       # 24-hour visual Bezier curve renderer
        ├── search.js            # City autocomplete & browser geolocation
        ├── ui.js                # DOM rendering, unit conversion, toasts
        └── api.js               # Fetch client wrapper
```

---

## 🧪 License
This project is open-source under the [MIT License](LICENSE).
