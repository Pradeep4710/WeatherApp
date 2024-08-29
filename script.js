const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".searchButton");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");
const cityDropdown = document.querySelector(".city-dropdown");
const locationButton = document.querySelector(".locationButton");

const API_KEY = "d0ee444dd47fd864ed2d2fc2c6a69922";

// Create or update a weather card
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather png">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather png">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </li>`;
    }
};

// Fetch and display weather details
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveForecastDays = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        // Clear previous content
        currentWeatherDiv.innerHTML = "";
        weatherCardDiv.innerHTML = "";

        // Create weather cards
        fiveForecastDays.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
            } else {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

        // Update dropdown menu
        updateCityDropdown(cityName);
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
};

// Fetch city coordinates and weather details
const getCityCoordinates = (cityName) => {
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}.`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
};

// Update dropdown menu with recently searched cities
const updateCityDropdown = (cityName) => {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    
    // Add new city if not already in the list
    if (cityName && !cities.includes(cityName)) {
        cities.unshift(cityName); // Add new city to the start of the array
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }

    // Limit the number of cities to 10
    if (cities.length > 10) {
        cities = cities.slice(0, 10);
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }

    // Update dropdown menu
    cityDropdown.innerHTML = ''; // Clear previous options

    // Add static option
    const headerOption = document.createElement("option");
    headerOption.textContent = "Recently Searched Cities";
    headerOption.disabled = true;
    headerOption.selected = true;
    cityDropdown.appendChild(headerOption);

    // Add recent cities
    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        cityDropdown.appendChild(option);
    });

    cityDropdown.style.display = cities.length > 0 ? 'block' : 'none'; // Show dropdown if there are cities
};

// Handle dropdown selection
cityDropdown.addEventListener("change", (event) => {
    const selectedCity = event.target.value;
    if (selectedCity) {
        getCityCoordinates(selectedCity); // Fetch weather data for selected city
    }
});

// Handle current location button click
const getCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherDetails("Your Location", lat, lon);
        }, () => {
            alert("Geolocation is not supported by this browser or permission denied.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};

// Search button event listener
searchButton.addEventListener("click", () => {
    const cityName = cityInput.value.trim();
    getCityCoordinates(cityName);
});

// Handle Enter key press in the search input
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const cityName = cityInput.value.trim();
        getCityCoordinates(cityName);
    }
});

// Current location button event listener
locationButton.addEventListener("click", getCurrentLocation);

// Initial dropdown population
updateCityDropdown('');