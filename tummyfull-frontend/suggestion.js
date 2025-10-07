const mealCategories = {
  breakfast: {
    hot: 'Italian',
    rainy: 'Chinese',
    cold: 'Thai',
    mild: 'Indian'
  },
  lunch: {
    hot: 'Italian',
    rainy: 'Chinese',
    cold: 'Thai',
    mild: 'Indian'
  },
  dinner: {
    hot: 'Italian',
    rainy: 'Chinese',
    cold: 'Thai',
    mild: 'Indian'
  }
};

const drinkCategories = {
  breakfast: {
    hot: 'Coffee_/_Tea',
    rainy: 'Coffee_/_Tea',
    cold: 'Coffee_/_Tea',
    mild: 'Ordinary_Drink'
  },
  lunch: {
    hot: 'Ordinary_Drink',
    rainy: 'Ordinary_Drink',
    cold: 'Ordinary_Drink',
    mild: 'Ordinary_Drink'
  },
  dinner: {
    hot: 'Ordinary_Drink',
    rainy: 'Ordinary_Drink',
    cold: 'Ordinary_Drink',
    mild: 'Ordinary_Drink'
  }
};

function getTimeType() {
  const hour = new Date().getHours();
  if (hour < 12) return 'breakfast';
  if (hour < 18) return 'lunch';
  return 'dinner';
}

function getWeatherType(temp, code) {
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  if (temp < 10) return 'cold';
  if (temp > 25) return 'hot';
  return 'mild';
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Unknown';
}

function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function createSuggestionCard(item, type) {
  const card = document.createElement('div');
  card.className = 'suggestion-item';
  let imageSrc = item.strMealThumb || item.strDrinkThumb || item.strMealThumb;
  if (type === 'drink' && item.strDrinkThumb) {
    imageSrc = item.strDrinkThumb;
  }
  card.innerHTML = `
    <img src="${imageSrc}" alt="${item.strMeal || item.strDrink}" onerror="this.src='images/placeholder.jpg'">
    <h3>${item.strMeal || item.strDrink}</h3>
    <p>${item.strCategory || 'Delicious'}</p>
  `;
  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');

  // Auth UI logic
  const authUser = (() => { try { return JSON.parse(localStorage.getItem('demoUser')||'null'); } catch(e){ return null; } })();

  // Check if user is logged in
  if (!authUser) {
    location.href = 'login.html';
    return;
  }
  const btnSign = document.getElementById('btnSign');
  const btnReserve = document.getElementById('btnReserve');
  const btnProfile = document.getElementById('btnProfile');
  const profileMenu = document.getElementById('profileMenu');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileName = document.getElementById('profileName');
  if (btnSign && btnReserve) {
    if (authUser) {
      btnSign.style.display = 'none';
      if (btnProfile) {
        btnProfile.style.display = 'inline-flex';
        btnProfile.innerHTML = `${authUser.name || 'Profile'} <i class='bx bxs-user-circle' style="margin-left:8px;font-size:20px"></i>`;
        if (profileName) profileName.textContent = authUser.name || 'Profile';
        btnProfile.onclick = () => {
          if (!profileMenu) return;
          profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
        };
      }
      btnReserve.onclick = () => { location.href = 'reservation.html'; };
    } else {
      btnSign.onclick = () => { location.href = 'login.html'; };
      btnReserve.onclick = () => { location.href = 'login.html'; };
    }
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      try { localStorage.removeItem('demoUser'); } catch(e){}
      location.href = 'index.html';
    };
  }

  const timeType = getTimeType();
  console.log('Time of day:', timeType);

  const fetchSuggestions = (timeType, weatherType) => {
    const drinkCat = drinkCategories[timeType][weatherType];

    // Clear existing suggestions
    document.getElementById('food-suggestions').innerHTML = '';
    document.getElementById('dessert-suggestions').innerHTML = '';
    document.getElementById('drink-suggestions').innerHTML = '';

    // Fetch random dishes
    const randomPromises = Array.from({length: 20}, () =>
      fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        .then(response => response.json())
        .then(data => data.meals[0])
    );

    Promise.all(randomPromises)
      .then(meals => {
        const foodGrid = document.getElementById('food-suggestions');
        meals.forEach(meal => {
          foodGrid.appendChild(createSuggestionCard(meal, 'food'));
        });
      })
      .catch(error => console.error('Error fetching random dishes:', error));

    // Fetch desserts
    fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert')
      .then(response => response.json())
      .then(data => {
        const desserts = getRandomItems(data.meals, 20);
        const dessertGrid = document.getElementById('dessert-suggestions');
        desserts.forEach(dessert => {
          dessertGrid.appendChild(createSuggestionCard(dessert, 'dessert'));
        });
      })
      .catch(error => console.error('Error fetching desserts:', error));

    // Fetch drinks based on weather and time
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${drinkCat}`)
      .then(response => response.json())
      .then(data => {
        const drinks = getRandomItems(data.drinks || [], 20);
        const drinkGrid = document.getElementById('drink-suggestions');
        drinks.forEach(drink => {
          drinkGrid.appendChild(createSuggestionCard(drink, 'drink'));
        });
      })
      .catch(error => console.error('Error fetching drinks:', error));
  };

  const updateWeather = () => {
    let weatherType = 'mild';
    if (navigator.geolocation) {
      console.log('Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(position => {
        console.log('Geolocation success:', position);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
          .then(response => {
            console.log('Weather API response status:', response.status);
            return response.json();
          })
          .then(data => {
            console.log('Weather API data:', data);
            if (data.current_weather) {
              const temp = data.current_weather.temperature;
              const code = data.current_weather.weathercode;
              weatherType = getWeatherType(temp, code);
              const weatherDisplay = document.getElementById('weather-display');
              weatherDisplay.innerHTML = `Temperature: ${temp}°C<br>Weather: ${getWeatherDescription(code)}<br>Time: ${timeType}`;
            }
            document.getElementById('loading-overlay').style.display = 'none';
            fetchSuggestions(timeType, weatherType);
          })
          .catch(error => {
            console.error('Error fetching weather:', error);
            const weatherDisplay = document.getElementById('weather-display');
            weatherDisplay.innerHTML = `Temperature: N/A<br>Weather: Unknown<br>Time: ${timeType}`;
            document.getElementById('loading-overlay').style.display = 'none';
            fetchSuggestions(timeType, weatherType);
          });
      }, error => {
        console.error('Geolocation error:', error);
        const weatherDisplay = document.getElementById('weather-display');
        weatherDisplay.innerHTML = `Temperature: N/A<br>Weather: Unknown<br>Time: ${timeType}`;
        document.getElementById('loading-overlay').style.display = 'none';
        fetchSuggestions(timeType, weatherType);
      });
    } else {
      console.log('Geolocation not supported');
      const weatherDisplay = document.getElementById('weather-display');
      weatherDisplay.innerHTML = `Temperature: N/A<br>Weather: Unknown<br>Time: ${timeType}`;
      document.getElementById('loading-overlay').style.display = 'none';
      fetchSuggestions(timeType, weatherType);
    }
  };

  const filterSuggestions = () => {
    const filterValue = document.getElementById('category-filter').value;
    document.getElementById('food-section').style.display = (filterValue === 'all' || filterValue === 'food') ? 'block' : 'none';
    document.getElementById('dessert-section').style.display = (filterValue === 'all' || filterValue === 'dessert') ? 'block' : 'none';
    document.getElementById('drink-section').style.display = (filterValue === 'all' || filterValue === 'drink') ? 'block' : 'none';
  };

  document.getElementById('category-filter').addEventListener('change', filterSuggestions);
  document.getElementById('refresh-suggestions').addEventListener('click', () => {
    updateWeather();
  });

  updateWeather();
});
