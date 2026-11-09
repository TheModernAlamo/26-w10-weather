import { useState, useEffect, useCallback } from 'react'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  AlertCircle,
  MapPin,
  Activity,
  Umbrella
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import './App.css'

// 날씨 코드에 매핑된 Lucide 아이콘 동적 렌더링 컴포넌트
function WeatherIconDisplay({ iconName, size = 48, color }) {
  const iconMap = {
    Sun,
    SunDim,
    CloudSun,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    Snowflake,
    CloudLightning,
  }

  const IconComponent = iconMap[iconName] || Cloud
  return <IconComponent size={size} color={color} className="weather-icon-svg" />
}

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 날씨 및 미세먼지 동시 호출
  const loadDashboardData = useCallback(async (city) => {
    setLoading(true)
    setError(null)
    try {
      const [weatherRes, airQualityRes] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])

      setWeather(weatherRes)
      setAirQuality(airQualityRes)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('데이터 조회 오류:', err)
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData(selectedCity)
  }, [selectedCity, loadDashboardData])

  // 현재 날씨 및 미세먼지 계산 값
  const currentWeather = weather?.current
  const currentAQ = airQuality?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const aqStatus = currentAQ ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5) : null

  return (
    <div className="weather-dashboard">
      {/* 헤더 섹션 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <h1 className="dashboard-title">
            <span className="title-highlight">실시간</span> 날씨 · 미세먼지 대시보드
          </h1>
          <p className="dashboard-subtitle">
            Open-Meteo 글로벌 기상 위성 API 기반 실시간 관측 데이터
          </p>
        </div>
        <div className="header-actions">
          {lastUpdated && (
            <span className="last-updated">
              업데이트: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            className="refresh-btn"
            onClick={() => loadDashboardData(selectedCity)}
            disabled={loading}
            title="데이터 새로고침"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            새로고침
          </button>
        </div>
      </header>

      {/* 도시 빠른 선택 바 */}
      <nav className="city-selector-nav" aria-label="주요 도시 빠른 선택">
        <div className="city-btn-list">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                <MapPin size={14} className="pin-icon" />
                {city.name}
              </button>
            )
          })}
        </div>
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className="dashboard-content">
        {loading && (
          <div className="status-container loading-container">
            <div className="spinner"></div>
            <p className="status-text">{selectedCity.name}의 기상 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {!loading && error && (
          <div className="status-container error-container">
            <AlertCircle size={44} className="error-icon" />
            <h2 className="error-heading">데이터를 불러오지 못했습니다</h2>
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadDashboardData(selectedCity)}
            >
              다시 시도하기
            </button>
          </div>
        )}

        {!loading && !error && currentWeather && currentAQ && (
          <div className="dashboard-cards-grid">
            {/* 1. 현재 날씨 카드 */}
            <article className="weather-card current-weather-card">
              <div className="card-header">
                <div className="city-badge">
                  <MapPin size={16} />
                  <span>{selectedCity.name}</span>
                </div>
                <span className="weather-status-tag" style={{ color: weatherInfo?.color }}>
                  {weatherInfo?.label}
                </span>
              </div>

              <div className="weather-main-section">
                <div className="weather-icon-bubble" style={{ backgroundColor: `${weatherInfo?.color}1a` }}>
                  <WeatherIconDisplay
                    iconName={weatherInfo?.icon}
                    size={64}
                    color={weatherInfo?.color}
                  />
                </div>
                <div className="temperature-group">
                  <div className="temp-display">
                    <span className="temp-value">{Math.round(currentWeather.temperature_2m)}</span>
                    <span className="temp-unit">°C</span>
                  </div>
                  <div className="apparent-temp">
                    체감 온도 <strong>{Math.round(currentWeather.apparent_temperature)}°C</strong>
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

            {/* 2. 미세먼지 & 대기질 카드 */}
            <article className="weather-card air-quality-card">
              <div className="card-header">
                <div className="aq-title-group">
                  <Activity size={18} />
                  <h2>미세먼지 및 대기질</h2>
                </div>
                <span
                  className="aq-badge"
                  style={{ backgroundColor: aqStatus?.badgeColor }}
                >
                  환경부 기준 {aqStatus?.status}
                </span>
              </div>

              <div className="aq-metric-container">
                {/* PM10 */}
                <div className="aq-metric-box">
                  <div className="aq-metric-top">
                    <span className="metric-name">미세먼지 (PM10)</span>
                    <span
                      className="metric-grade"
                      style={{
                        color:
                          currentAQ.pm10 > 150
                            ? '#ef4444'
                            : currentAQ.pm10 > 80
                            ? '#f97316'
                            : currentAQ.pm10 > 30
                            ? '#3b82f6'
                            : '#10b981',
                      }}
                    >
                      {currentAQ.pm10 > 150
                        ? '매우나쁨'
                        : currentAQ.pm10 > 80
                        ? '나쁨'
                        : currentAQ.pm10 > 30
                        ? '보통'
                        : '좋음'}
                    </span>
                  </div>
                  <div className="metric-val-row">
                    <span className="metric-number">{Math.round(currentAQ.pm10)}</span>
                    <span className="metric-unit">μg/m³</span>
                  </div>
                  <div className="metric-gauge-bar">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${Math.min(100, (currentAQ.pm10 / 180) * 100)}%`,
                        backgroundColor:
                          currentAQ.pm10 > 150
                            ? '#ef4444'
                            : currentAQ.pm10 > 80
                            ? '#f97316'
                            : currentAQ.pm10 > 30
                            ? '#3b82f6'
                            : '#10b981',
                      }}
                    ></div>
                  </div>
                  <div className="metric-scale-guide">
                    <span>0 좋음</span>
                    <span>30 보통</span>
                    <span>80 나쁨</span>
                    <span>150+</span>
                  </div>
                </div>

                {/* PM2.5 */}
                <div className="aq-metric-box">
                  <div className="aq-metric-top">
                    <span className="metric-name">초미세먼지 (PM2.5)</span>
                    <span
                      className="metric-grade"
                      style={{
                        color:
                          currentAQ.pm2_5 > 75
                            ? '#ef4444'
                            : currentAQ.pm2_5 > 35
                            ? '#f97316'
                            : currentAQ.pm2_5 > 15
                            ? '#3b82f6'
                            : '#10b981',
                      }}
                    >
                      {currentAQ.pm2_5 > 75
                        ? '매우나쁨'
                        : currentAQ.pm2_5 > 35
                        ? '나쁨'
                        : currentAQ.pm2_5 > 15
                        ? '보통'
                        : '좋음'}
                    </span>
                  </div>
                  <div className="metric-val-row">
                    <span className="metric-number">{Math.round(currentAQ.pm2_5)}</span>
                    <span className="metric-unit">μg/m³</span>
                  </div>
                  <div className="metric-gauge-bar">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${Math.min(100, (currentAQ.pm2_5 / 90) * 100)}%`,
                        backgroundColor:
                          currentAQ.pm2_5 > 75
                            ? '#ef4444'
                            : currentAQ.pm2_5 > 35
                            ? '#f97316'
                            : currentAQ.pm2_5 > 15
                            ? '#3b82f6'
                            : '#10b981',
                      }}
                    ></div>
                  </div>
                  <div className="metric-scale-guide">
                    <span>0 좋음</span>
                    <span>15 보통</span>
                    <span>35 나쁨</span>
                    <span>75+</span>
                  </div>
                </div>
              </div>

              {/* 하단 환경부 기준 요약 안내 */}
              <div className="aq-footer-info">
                <span>유럽 대기질 지수(AQI): <strong>{currentAQ.european_aqi ?? '측정중'}</strong></span>
                <span className="dot-divider">•</span>
                <span>대한민국 환경부 예보 기준 준수</span>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="dashboard-footer">
        <p>실시간 관측 데이터 제공: <strong>Open-Meteo Free Weather & Air Quality API</strong></p>
        <p className="footer-sub">보안 아키텍처: HTTPS 암호화 통신 & UI/API 레이어 분리 설계</p>
      </footer>
    </div>
  )
}

export default App
