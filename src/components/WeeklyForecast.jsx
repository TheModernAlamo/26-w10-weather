import { Calendar, Umbrella } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function WeeklyForecast({ dailyData }) {
  if (!dailyData || !dailyData.time) return null

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

  // 전체 7일간의 최저/최고값 (기온 막대 바 비율 계산용)
  const allMins = dailyData.temperature_2m_min || []
  const allMaxs = dailyData.temperature_2m_max || []
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const globalRange = Math.max(1, globalMax - globalMin)

  const items = dailyData.time.slice(0, 7).map((dateStr, idx) => {
    const date = new Date(dateStr)
    const dayName = daysOfWeek[date.getDay()]
    const monthDay = `${date.getMonth() + 1}.${date.getDate()}`
    const label = idx === 0 ? '오늘' : idx === 1 ? '내일' : `${dayName}요일`

    const min = Math.round(dailyData.temperature_2m_min[idx])
    const max = Math.round(dailyData.temperature_2m_max[idx])
    const precip = dailyData.precipitation_probability_max
      ? dailyData.precipitation_probability_max[idx]
      : null
    const code = dailyData.weather_code[idx]
    const weather = getWeatherInfo(code)

    // 막대 바의 시작 위치(left%)와 길이(width%)
    const leftPercent = ((min - globalMin) / globalRange) * 100
    const widthPercent = Math.max(8, ((max - min) / globalRange) * 100)

    return {
      dateStr,
      label,
      monthDay,
      min,
      max,
      precip,
      weather,
      leftPercent,
      widthPercent,
      isToday: idx === 0,
    }
  })

  return (
    <article className="weather-card weekly-forecast-card">
      <div className="card-header">
        <div className="weekly-title-group">
          <Calendar size={18} />
          <h2>향후 7일간 주간 일기예보</h2>
        </div>
        <span className="weekly-subtitle">최저 / 최고 기온</span>
      </div>

      <div className="weekly-list">
        {items.map((item) => (
          <div
            key={item.dateStr}
            className={`weekly-row ${item.isToday ? 'today-row' : ''}`}
          >
            {/* 요일 및 날짜 */}
            <div className="day-col">
              <span className="day-label">{item.label}</span>
              <span className="day-sub">{item.monthDay}</span>
            </div>

            {/* 날씨 상태 및 아이콘 */}
            <div className="weather-col">
              <WeatherIcon
                iconName={item.weather.icon}
                size={22}
                color={item.weather.color}
              />
              <span className="weather-text">{item.weather.label}</span>
            </div>

            {/* 강수 확률 */}
            <div className="precip-col">
              {item.precip !== null && item.precip > 0 ? (
                <span className="precip-badge">
                  <Umbrella size={13} />
                  {item.precip}%
                </span>
              ) : (
                <span className="precip-empty">-</span>
              )}
            </div>

            {/* 기온 막대 바 & 수치 */}
            <div className="temp-range-col">
              <span className="min-temp-label">{item.min}°</span>
              <div className="range-bar-track">
                <div
                  className="range-bar-fill"
                  style={{
                    left: `${item.leftPercent}%`,
                    width: `${item.widthPercent}%`,
                  }}
                ></div>
              </div>
              <span className="max-temp-label">{item.max}°</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

