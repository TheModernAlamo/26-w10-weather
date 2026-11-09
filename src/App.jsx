import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle, MapPin } from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 날씨 및 미세먼지 데이터 동시 병렬 조회
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
      console.error('기상 데이터 조회 실패:', err)
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData(selectedCity)
  }, [selectedCity, loadDashboardData])

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
            Open-Meteo 전 세계 기상 위성 API 기반 실시간 관측 및 7일 예보
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

      {/* 도시 검색창 (400ms 디바운스 적용) */}
      <section className="search-section" aria-label="전 세계 도시 검색">
        <CitySearch onSelectCity={(city) => setSelectedCity(city)} />
      </section>

      {/* 주요 도시 빠른 선택 버튼 바 */}
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

        {!loading && !error && weather && airQuality && (
          <div className="dashboard-layout-stack">
            {/* 상단 2열 그리드: 현재 날씨 + 미세먼지 */}
            <div className="dashboard-cards-grid">
              <CurrentWeather
                city={selectedCity}
                currentWeather={currentWeather}
                weatherInfo={weatherInfo}
              />
              <AirQualityCard
                currentAQ={currentAQ}
                aqStatus={aqStatus}
              />
            </div>

            {/* 중단: 24시간 시간별 기온 차트 */}
            <HourlyChart hourlyData={weather.hourly} />

            {/* 하단: 향후 7일간 주간 예보 */}
            <WeeklyForecast dailyData={weather.daily} />
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="dashboard-footer">
        <p>실시간 관측 데이터 제공: <strong>Open-Meteo Free Weather & Air Quality API</strong></p>
        <p className="footer-sub">
          사이버보안 아키텍처: HTTPS 암호화 통신, 400ms 디바운스 DoS 방지 & UI/API 레이어 분리
        </p>
      </footer>
    </div>
  )
}

export default App
