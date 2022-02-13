const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecast = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const cityInput = document.getElementById('searchBar');
const placeContainer = document.getElementById('place-container');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const API_KEY = '5ae56154b9ca6e943e59b5e4740e026d'

window.addEventListener('load', () => {
  setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat)+ `:${minutes} <span id="am-pm">${ampm}</span>`;
    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
  }, 1000);
});


const WeatherData = (() => {
  navigator.geolocation.getCurrentPosition((success) => {
    const { latitude, longitude } = success.coords;
    getData(latitude, longitude);
  }, (error) => {
    console.error(error);
    getData(25.0330, 121.5654);
  });
  function getData(lat, lon) {
    // a loader animation to let user know they are running
    currentWeatherItemsEl.innerHTML = '<div class="loader"></div>';
    currentTempEl.innerHTML = '<div class="loader"></div>';
    weatherForecast.innerHTML = '<div class="loader"></div>';
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
      .then(response => response.json())
      .then(data => {
        // todo del
        console.log(data);
        showWeatherData(data);
      });
  }
  function showWeatherData(data) {
    const { humidity, pressure, sunrise, sunset, wind_speed } = data.current;
    const UTCTime = (value) => {
      const fullTime = new Date(value * 1000);
      const a_p = fullTime.getHours() >= 12 ? 'PM' : 'AM';
      const time = `${fullTime.getHours()}:${fullTime.getMinutes()} ${a_p}`;
      const day = days[fullTime.getDay()].slice(0, 3);
      return {time, day};
    };

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = `${data.lat}N ${data.lon}E`;
    currentWeatherItemsEl.innerHTML =
      `<div class="weather-item">
        <div>Humidity</div>
        <div>${humidity}%</div>
      </div>
      <div class="weather-item">
        <div>Pressure</div>
        <div>${pressure}</div>
      </div>
      <div class="weather-item">
        <div>Wind Speed</div>
        <div>${wind_speed}</div>
      </div>
  
      <div class="weather-item">
        <div>Sunrise</div>
        <div>${UTCTime(sunrise).time}:</div>
      </div>
      <div class="weather-item">
        <div>Sunset</div>
        <div>${UTCTime(sunset).time}</div>
      </div>
    `;

    let otherDaysForecast = '';
    data.daily.forEach((day, index) => {
      if (index == 0) {
        currentTempEl.innerHTML = `
          <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather-icon" class="w-icon">
          <div class="other">
            <div class="day">${UTCTime(day.dt).day}</div>
            <div class="temp">Night: ${day.temp.night}&#176; C</div>
            <div class="temp">Day: ${day.temp.day}&#176; C</div>
          </div>
        `
      } else {
        otherDaysForecast += `
          <div class="weather-forecast-item">
            <div class="day">${UTCTime(day.dt).day}</div>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather-icon" class="w-icon">
            <div class="temp">Night: ${day.temp.night}&#176; C</div>
            <div class="temp">Day: ${day.temp.day}&#176; C</div>
          </div>
        `
      }
    });
    weatherForecast.innerHTML = otherDaysForecast;
  }
  return {getData}
})();

const CityData = (() => {
  cityInput.addEventListener('change', () => {
    if (cityInput.value) {
      const cityName = cityInput.value;
      searchCityLoc(cityName);
    }
  });
  async function searchCityLoc(city) {
    try {
      const res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
      const data = await res.json();
      const {lat, lon} = await data[0];
      WeatherData.getData(lat, lon);
    } catch (err) {
      const hintMsg = document.createElement('div');
      hintMsg.textContent = '😅Oops, we have no info about the city';
      placeContainer.appendChild(hintMsg);
      console.error(err);
    }
  }
})();