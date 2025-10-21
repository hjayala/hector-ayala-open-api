// Miami coordinates
const latitude = 25.7617;
const longitude = -80.1918;

// Navigation elements
const currentButton = document.getElementById('currentButton');
const forecastButton = document.getElementById('forecastButton');
const currentView = document.getElementById('currentView');
const forecastView = document.getElementById('forecastView');

// Flag to track if data has been loaded
let currentWeatherLoaded = false;
let forecastWeatherLoaded = false;

// Initialize - Load current weather by default
loadCurrentWeather();

// Navigation event listeners
currentButton.addEventListener('click', () => {
    switchView('current');
    if (!currentWeatherLoaded) {
        loadCurrentWeather();
    }
});

forecastButton.addEventListener('click', () => {
    switchView('forecast');
    if (!forecastWeatherLoaded) {
        loadForecast();
    }
});

function switchView(view) {
    if (view === 'current') {
        currentButton.classList.add('active');
        forecastButton.classList.remove('active');
        currentView.classList.add('active');
        forecastView.classList.remove('active');
    } else {
        forecastButton.classList.add('active');
        currentButton.classList.remove('active');
        forecastView.classList.add('active');
        currentView.classList.remove('active');
    }
}

// Fetch current weather data (Endpoint 1)
async function loadCurrentWeather() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch current weather data');
        }
        
        const data = await response.json();
        displayCurrentWeather(data);
        currentWeatherLoaded = true;
    } catch (error) {
        displayError('currentWeather', 'Unable to load current weather. Please try again later.');
        console.error('Error fetching current weather:', error);
    }
}

// Fetch 7-day forecast data (Endpoint 2)
async function loadForecast() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const data = await response.json();
        displayForecast(data);
        forecastWeatherLoaded = true;
    } catch (error) {
        displayError('forecastWeather', 'Unable to load forecast. Please try again later.');
        console.error('Error fetching forecast:', error);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const current = data.current;
    const weatherDescription = getWeatherDescription(current.weather_code);
    
    const html = `
        <div class="current-card">
            <h2>${weatherDescription}</h2>
            <div class="temperature">${Math.round(current.temperature_2m)}°F</div>
            <p style="font-size: 1.1rem; color: #666;">Feels like ${Math.round(current.apparent_temperature)}°F</p>
            
            <div class="weather-details">
                <div class="detail-card">
                    <h3>Humidity</h3>
                    <p>${current.relative_humidity_2m}%</p>
                </div>
                <div class="detail-card">
                    <h3>Wind Speed</h3>
                    <p>${Math.round(current.wind_speed_10m)} mph</p>
                </div>
                <div class="detail-card">
                    <h3>Temperature</h3>
                    <p>${Math.round(current.temperature_2m)}°F</p>
                </div>
            </div>
        </div>
    `;
    
    showContent('currentWeather', html);
}

// Display 7-day forecast
function displayForecast(data) {
    const daily = data.daily;
    let html = '<div class="forecast-grid">';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        html += `
            <div class="forecast-card">
                <div class="forecast-date">${dayName}</div>
                <div class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}°</div>
                <div style="color: #999; font-size: 0.9rem;">Low: ${Math.round(daily.temperature_2m_min[i])}°</div>
                <div class="forecast-details">
                    <div>💧 ${daily.precipitation_probability_max[i]}%</div>
                    <div>💨 ${Math.round(daily.wind_speed_10m_max[i])} mph</div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    showContent('forecastWeather', html);
}

// Helper function to show content and hide loading
function showContent(elementId, html) {
    const element = document.getElementById(elementId);
    element.innerHTML = html;
    element.classList.remove('hidden');
    element.previousElementSibling.style.display = 'none';
}

// Helper function to display errors
function displayError(elementId, message) {
    const html = `<div class="error">${message}</div>`;
    showContent(elementId, html);
}

// Convert weather codes to descriptions
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Heavy Hail'
    };
    
    return weatherCodes[code] || 'Unknown';
}