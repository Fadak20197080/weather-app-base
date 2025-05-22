import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const OPEN_WEATHER_API_KEY = "304f81ea84d253ce256403b6d821f632"; // My key

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!city) return;

    axios
      .get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPEN_WEATHER_API_KEY}`
      )
      .then((response) => {
        if (response.data.length === 0) {
          throw new Error("City not found");
        }
        return response.data[0];
      })
      .then((cityGeoData) => {
        const { lat, lon } = cityGeoData;
        return Promise.all([
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
          ),
          axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
          ),
        ]);
      })
      .then(([weatherRes, forecastRes]) => {
        setWeather(weatherRes.data);
        setForecast(forecastRes.data.list.slice(0, 16)); // We show the first 16 points (approximately 2 days)
        setError("");
      })
      .catch((err) => {
        setError(err.message);
        setWeather(null);
        setForecast([]);
      });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Weather App</h1>
      <p>Enter a city name to get the current weather and 5-day forecast</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="City name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div style={{ marginTop: "20px" }}>
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Description: {weather.weather[0].description}</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather icon"
          />
        </div>
      )}

      {forecast.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>5-Day Forecast (Every 3 Hours)</h2>

          {/* Chart*/}
          <div style={{ width: "100%", height: 300, marginBottom: "30px" }}>
            <ResponsiveContainer>
              <LineChart data={forecast}>
                <CartesianGrid stroke="#ccc" />
                <XAxis
                  dataKey="dt_txt"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip
                  formatter={(value) => [`${value}°C`, "Temp"]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="main.temp"
                  stroke="#8884d8"
                  name="Temp (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expectations table*/}
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Temp (°C)</th>
                <th>Description</th>
                <th>Icon</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((item, index) => (
                <tr key={index}>
                  <td>{formatDate(item.dt_txt)}</td>
                  <td>{item.main.temp}</td>
                  <td>{item.weather[0].description}</td>
                  <td>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                      alt=""
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
