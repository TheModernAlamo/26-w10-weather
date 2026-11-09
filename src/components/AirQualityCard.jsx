import { Activity } from 'lucide-react'

export default function AirQualityCard({ currentAQ, aqStatus }) {
  if (!currentAQ) return null

  const getPM10Grade = (val) => {
    if (val > 150) return { label: '매우나쁨', color: '#ef4444' }
    if (val > 80) return { label: '나쁨', color: '#f97316' }
    if (val > 30) return { label: '보통', color: '#3b82f6' }
    return { label: '좋음', color: '#10b981' }
  }

  const getPM25Grade = (val) => {
    if (val > 75) return { label: '매우나쁨', color: '#ef4444' }
    if (val > 35) return { label: '나쁨', color: '#f97316' }
    if (val > 15) return { label: '보통', color: '#3b82f6' }
    return { label: '좋음', color: '#10b981' }
  }

  const pm10Grade = getPM10Grade(currentAQ.pm10)
  const pm25Grade = getPM25Grade(currentAQ.pm2_5)

  return (
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
            <span className="metric-grade" style={{ color: pm10Grade.color }}>
              {pm10Grade.label}
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
                backgroundColor: pm10Grade.color,
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
            <span className="metric-grade" style={{ color: pm25Grade.color }}>
              {pm25Grade.label}
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
                backgroundColor: pm25Grade.color,
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

      <div className="aq-footer-info">
        <span>유럽 대기질 지수(AQI): <strong>{currentAQ.european_aqi ?? '측정중'}</strong></span>
        <span className="dot-divider">•</span>
        <span>대한민국 환경부 예보 기준 준수</span>
      </div>
    </article>
  )
}

