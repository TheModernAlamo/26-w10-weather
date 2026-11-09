import { useState, useEffect, useCallback, useMemo } from 'react'
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
import FlightAlertCard from './components/FlightAlertCard'
import './App.css'

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [tempUnit, setTempUnit] = useState('C') // 'C' | 'F'

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

  // 1. 주야간(is_day) 및 날씨 코드(weather_code) 기반 동적 테마 클래스 산출
  const themeClass = useMemo(() => {
    if (!currentWeather) return 'theme-day-clear'
    const isDay = currentWeather.is_day === 1
    const code = currentWeather.weather_code

    if (code === 95) return 'theme-thunder'
    if ([71, 73, 75, 77].includes(code)) return 'theme-snow'
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'theme-rain'
    if ([45, 48].includes(code)) return 'theme-fog'
    if (code === 3) return 'theme-cloudy'
    if ([1, 2].includes(code)) {
      return isDay ? 'theme-day-partly' : 'theme-night-partly'
    }
    return isDay ? 'theme-day-clear' : 'theme-night-clear'
  }, [currentWeather])

  return (
    <div className={`weather-dashboard-wrapper ${themeClass}`}>
      <div className="weather-dashboard">
        {/* 헤더 섹션 */}
        <header className="dashboard-header">
          <div className="header-title-wrap">
            <h1 className="dashboard-title">
              <span className="title-highlight">실시간</span> 날씨 · 미세먼지 대시보드
            </h1>
            <p className="dashboard-subtitle">
              Open-Meteo 전 세계 기상 위성 API 기반 실시간 관측 및 스마트 기상 안내
            </p>
          </div>
          <div className="header-actions">
            {/* 3. 섭씨/화씨 토글 스위치 */}
            <div className="unit-toggle-group" aria-label="기온 단위 선택">
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'C' ? 'active' : ''}`}
                onClick={() => setTempUnit('C')}
                title="섭씨 온도로 보기"
              >
                °C
              </button>
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'F' ? 'active' : ''}`}
                onClick={() => setTempUnit('F')}
                title="화씨 온도로 보기"
              >
                °F
              </button>
            </div>

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
              {/* 2. 공항 인접 지역 감지 시 항공편 결항/지연 위험도 알림 카드 */}
              <FlightAlertCard
                cityName={selectedCity.name}
                currentWeather={currentWeather}
              />

              {/* 상단 2열 그리드: 현재 날씨 + 미세먼지 */}
              <div className="dashboard-cards-grid">
                <CurrentWeather
                  city={selectedCity}
                  currentWeather={currentWeather}
                  weatherInfo={weatherInfo}
                  unit={tempUnit}
                />
                <AirQualityCard
                  currentAQ={currentAQ}
                  aqStatus={aqStatus}
                />
              </div>

              {/* 중단: 24시간 시간별 기온 차트 */}
              <HourlyChart
                hourlyData={weather.hourly}
                unit={tempUnit}
              />

              {/* 하단: 향후 7일간 주간 예보 */}
              <WeeklyForecast
                dailyData={weather.daily}
                unit={tempUnit}
              />
            </div>
          )}
        </main>

        {/* 푸터 */}
        <footer className="dashboard-footer">
          <p>실시간 관측 데이터 제공: <strong>Open-Meteo Free Weather & Air Quality API</strong></p>
          <p className="footer-sub">
            스마트 기상 솔루션: 주야간 동적 테마, 공항 항공 기상 안전 지수 & 섭씨/화씨 전역 동기화
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
