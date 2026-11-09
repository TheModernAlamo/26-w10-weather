import { useMemo } from 'react'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function HourlyChart({ hourlyData }) {
  const chartData = useMemo(() => {
    if (!hourlyData || !hourlyData.time || !hourlyData.temperature_2m) return []

    const now = new Date()
    const currentHourStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`

    // 현재 시각 인덱스 찾기 (실패 시 0부터 24개)
    let startIndex = hourlyData.time.findIndex((t) => t >= currentHourStr)
    if (startIndex === -1 || startIndex + 24 > hourlyData.time.length) {
      startIndex = 0
    }

    const times = hourlyData.time.slice(startIndex, startIndex + 24)
    const temps = hourlyData.temperature_2m.slice(startIndex, startIndex + 24)
    const codes = hourlyData.weather_code
      ? hourlyData.weather_code.slice(startIndex, startIndex + 24)
      : []

    return times.map((t, idx) => {
      const date = new Date(t)
      const hour = date.getHours()
      return {
        time: `${hour}시`,
        temp: Math.round(temps[idx]),
        rawTemp: temps[idx],
        code: codes[idx] ?? 0,
        isCurrent: idx === 0,
      }
    })
  }, [hourlyData])

  if (chartData.length === 0) return null

  const temps = chartData.map((d) => d.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = Math.max(1, maxTemp - minTemp)

  // SVG 차트 좌표 설정
  const pointWidth = 52
  const svgWidth = Math.max(780, chartData.length * pointWidth)
  const svgHeight = 160
  const paddingTop = 36
  const paddingBottom = 40

  const points = chartData.map((d, i) => {
    const x = i * pointWidth + pointWidth / 2
    const ratio = (d.temp - minTemp) / tempRange
    const y = svgHeight - paddingBottom - ratio * (svgHeight - paddingTop - paddingBottom)
    return { x, y, ...d }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${points[0].x},${svgHeight - paddingBottom} ${polylinePoints} ${points[points.length - 1].x},${svgHeight - paddingBottom}`

  return (
    <article className="weather-card hourly-chart-card">
      <div className="card-header">
        <div className="chart-title-group">
          <Clock size={18} />
          <h2>향후 24시간 시간별 기온 예보</h2>
        </div>
        <div className="chart-temp-range">
          <span className="max-tag">
            <TrendingUp size={14} /> 최고 {maxTemp}°C
          </span>
          <span className="min-tag">
            <TrendingDown size={14} /> 최저 {minTemp}°C
          </span>
        </div>
      </div>

      <div className="chart-scroll-wrapper">
        <svg
          className="hourly-svg"
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* 배경 면적 */}
          <polygon points={areaPoints} fill="url(#chartGradient)" />

          {/* 꺾은선 */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 각 시각 데이터 포인트 및 레이블 */}
          {points.map((p, idx) => {
            const weather = getWeatherInfo(p.code)
            return (
              <g key={`point-${idx}`} className="chart-node">
                {/* 수직 보조선 */}
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.x}
                  y2={svgHeight - paddingBottom}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="2,2"
                />

                {/* 온도 레이블 */}
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="chart-temp-text"
                  fill="currentColor"
                >
                  {p.temp}°
                </text>

                {/* 포인트 점 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.isCurrent ? 5 : 3.5}
                  fill={p.isCurrent ? '#ef4444' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* 시간 레이블 */}
                <text
                  x={p.x}
                  y={svgHeight - 16}
                  textAnchor="middle"
                  className={`chart-time-text ${p.isCurrent ? 'current-hour' : ''}`}
                  fill="currentColor"
                >
                  {p.isCurrent ? '지금' : p.time}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </article>
  )
}

