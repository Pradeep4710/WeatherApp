const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".searchButton");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

const API_KEY = "d0ee444dd47fd864ed2d2fc2c6a69922";

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0){  // HTML for the main banner card of current day
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                </div>
                <div class="icon">
                    <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather png">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else { // HTML for the main banner card of 5 day forecast
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather png">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </li>`
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        // Filtering the 5 day forecast data into day by day data
        const uniqueForecastDays = [];
        const fiveForecastDays = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate(); // Convert to Date object
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        // Clearing previous empty cards
        currentWeatherDiv.value = "";
        cityInput.value = "";
        weatherCardDiv.innerHTML = "";

        console.log(fiveForecastDays);
        fiveForecastDays.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index); 
            } else {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
};


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates fount for ${cityName}.`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

searchButton.addEventListener("click", getCityCoordinates) 