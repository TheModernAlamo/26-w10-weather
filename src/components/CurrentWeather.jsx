import { MapPin, Droplets, Wind, Umbrella, Thermometer } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { convertTemp } from '../utils/temperature'

export default function CurrentWeather({ city, currentWeather, weatherInfo, unit = 'C' }) {
  if (!currentWeather) return null

  const tempDisplay = convertTemp(currentWeather.temperature_2m, unit)
  const apparentTempDisplay = convertTemp(currentWeather.apparent_temperature, unit)

  return (
    <article className="weather-card current-weather-card">
      <div className="card-header">
        <div className="city-badge">
          <MapPin size={16} />
          <span>{city.name}</span>
        </div>
        <span className="weather-status-tag" style={{ color: weatherInfo?.color }}>
          {weatherInfo?.label}
        </span>
      </div>

      <div className="weather-main-section">
        <div
          className="weather-icon-bubble"
          style={{ backgroundColor: `${weatherInfo?.color}1a` }}
        >
          <WeatherIcon
            iconName={weatherInfo?.icon}
            size={64}
            color={weatherInfo?.color}
          />
        </div>
        <div className="temperature-group">
          <div className="temp-display">
            <span className="temp-value">{tempDisplay}</span>
            <span className="temp-unit">°{unit}</span>
          </div>
          <div className="apparent-temp">
            체감 온도 <strong>{apparentTempDisplay}°{unit}</strong>
          </div>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <div className="detail-label">
            <Droplets size={16} className="detail-icon" />
            <span>습도</span>
          </div>
          <span className="detail-value">{currentWeather.relative_humidity_2m}%</span>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <Wind size={16} className="detail-icon" />
            <span>풍속</span>
          </div>
          <span className="detail-value">{currentWeather.wind_speed_10m} km/h</span>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <Umbrella size={16} className="detail-icon" />
            <span>강수량</span>
          </div>
          <span className="detail-value">{currentWeather.precipitation} mm</span>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <Thermometer size={16} className="detail-icon" />
            <span>상태</span>
          </div>
          <span className="detail-value">{weatherInfo?.label}</span>
        </div>
      </div>
    </article>
  )
}
