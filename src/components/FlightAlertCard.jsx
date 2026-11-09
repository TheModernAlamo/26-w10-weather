import { Plane, AlertTriangle, CheckCircle2, AlertOctagon, Info } from 'lucide-react'

// 대한민국 및 글로벌 주요 공항 매핑 테이블
const AIRPORT_KEYWORDS = [
  { match: '강서', airportName: '김포국제공항 (GMP)', code: 'GMP' },
  { match: '시청', airportName: '김포국제공항 (GMP) 권역', code: 'GMP' },
  { match: '인천', airportName: '인천국제공항 (ICN)', code: 'ICN' },
  { match: '제주', airportName: '제주국제공항 (CJU)', code: 'CJU' },
  { match: '부산', airportName: '김해국제공항 (PUS)', code: 'PUS' },
  { match: '대구', airportName: '대구국제공항 (TAE)', code: 'TAE' },
  { match: '광주', airportName: '광주공항 (KWJ)', code: 'KWJ' },
  { match: '공항', airportName: '인근 항공 운항 권역', code: 'AIRPORT' },
  { match: 'airport', airportName: '인근 국제공항 권역', code: 'AIRPORT' },
  { match: 'tokyo', airportName: '하네다/나리타 공항 (HND/NRT)', code: 'TYO' },
  { match: 'osaka', airportName: '간사이국제공항 (KIX)', code: 'KIX' },
  { match: 'fukuoka', airportName: '후쿠오카공항 (FUK)', code: 'FUK' },
  { match: 'paris', airportName: '샤를 드 골 공항 (CDG)', code: 'CDG' },
  { match: 'london', airportName: '히드로공항 (LHR)', code: 'LHR' },
  { match: 'new york', airportName: 'JFK 국제공항 (JFK)', code: 'JFK' },
  { match: 'singapore', airportName: '창이국제공항 (SIN)', code: 'SIN' },
  { match: 'bangkok', airportName: '수완나품공항 (BKK)', code: 'BKK' },
]

/**
 * 도시명을 기반으로 주변 공항 탐지
 */
export function detectAirport(cityName) {
  if (!cityName) return null
  const lower = cityName.toLowerCase()
  const found = AIRPORT_KEYWORDS.find((item) => lower.includes(item.match.toLowerCase()))
  return found || null
}

/**
 * 기상 데이터에 따른 항공편 결항/지연 위험도 평가
 */
export function evaluateFlightRisk({ windSpeed = 0, weatherCode = 0, precipitation = 0 }) {
  const reasons = []
  let level = 'normal' // 'normal' | 'caution' | 'warning'

  // 1. 뇌우 (천둥번개) - 즉시 결항/지연 위험
  if (weatherCode === 95) {
    level = 'warning'
    reasons.push('뇌우 및 번개로 인한 항공기 이착륙 중단 위험')
  }

  // 2. 폭설 및 강설 - 제설/방빙(De-icing) 작업으로 인한 대규모 지연
  if (weatherCode === 75) {
    level = 'warning'
    reasons.push('폭설로 인한 활주로 제설 및 항공기 방빙 작업 지연')
  } else if ([71, 73, 77].includes(weatherCode)) {
    if (level !== 'warning') level = 'caution'
    reasons.push('강설로 인한 항공기 결빙 방지 작업 지연 가능성')
  }

  // 3. 풍속 - 윈드시어 및 측풍(Crosswind) 위험
  if (windSpeed >= 45) {
    level = 'warning'
    reasons.push(`강풍 주의보(풍속 ${windSpeed} km/h)로 인한 결항/복행 위험`)
  } else if (windSpeed >= 30) {
    if (level !== 'warning') level = 'caution'
    reasons.push(`돌풍 및 강한 바람(풍속 ${windSpeed} km/h)으로 착륙 지연 우려`)
  }

  // 4. 안개 - 저시정 경보(Low Visibility)
  if ([45, 48].includes(weatherCode)) {
    if (level !== 'warning') level = 'caution'
    reasons.push('짙은 안개로 인한 저시정 운항 및 착륙 회항(Divert) 가능성')
  }

  // 5. 폭우
  if ([65, 82].includes(weatherCode) || precipitation >= 10) {
    if (level !== 'warning') level = 'caution'
    reasons.push('강한 비와 활주로 수막현상으로 인한 이착륙 간격 증대')
  }

  if (reasons.length === 0) {
    reasons.push('시정 및 풍속 양호 — 항공기 이착륙에 적합한 기상 조건')
  }

  const config = {
    normal: {
      label: '정상 운항 (Normal)',
      sub: '기상 조건이 양호하여 정시 운항이 예상됩니다.',
      badgeClass: 'flight-badge-normal',
      cardClass: 'flight-card-normal',
      Icon: CheckCircle2,
      color: '#10b981',
    },
    caution: {
      label: '지연 주의 (Caution)',
      sub: '기상 악화로 인해 연결편 지연 또는 출발 대기가 발생할 수 있습니다.',
      badgeClass: 'flight-badge-caution',
      cardClass: 'flight-card-caution',
      Icon: AlertTriangle,
      color: '#f59e0b',
    },
    warning: {
      label: '결항 / 대규모 지연 위험 (High Risk)',
      sub: '악천후로 인해 항공편 결항이나 장시간 지연 가능성이 높습니다.',
      badgeClass: 'flight-badge-warning',
      cardClass: 'flight-card-warning',
      Icon: AlertOctagon,
      color: '#ef4444',
    },
  }

  return {
    level,
    reasons,
    ...config[level],
  }
}

export default function FlightAlertCard({ cityName, currentWeather }) {
  if (!currentWeather) return null

  const airport = detectAirport(cityName)
  if (!airport) return null // 공항 권역이 아니면 렌더링하지 않음

  const risk = evaluateFlightRisk({
    windSpeed: currentWeather.wind_speed_10m,
    weatherCode: currentWeather.weather_code,
    precipitation: currentWeather.precipitation,
  })

  const StatusIcon = risk.Icon

  return (
    <article className={`weather-card flight-alert-card ${risk.cardClass}`}>
      <div className="flight-card-header">
        <div className="flight-title-wrap">
          <div className="plane-icon-bubble">
            <Plane size={20} className="plane-icon" />
          </div>
          <div>
            <h2 className="flight-main-title">항공 기상 및 운항 전망</h2>
            <span className="airport-target-name">{airport.airportName}</span>
          </div>
        </div>

        <div className={`flight-status-badge ${risk.badgeClass}`}>
          <StatusIcon size={16} />
          <span>{risk.label}</span>
        </div>
      </div>

      <div className="flight-card-body">
        <p className="flight-summary-text">{risk.sub}</p>

        <div className="flight-reasons-list">
          {risk.reasons.map((reason, idx) => (
            <div key={idx} className="flight-reason-item">
              <span className="reason-bullet" style={{ backgroundColor: risk.color }}></span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flight-card-footer">
        <Info size={14} className="flight-info-icon" />
        <span>
          실제 결항/지연 여부는 공항 활주로 관제 및 항공사 정책에 따라 변동될 수 있으므로, 출발 전 항공사 공식 운항 현황을 반드시 확인하세요.
        </span>
      </div>
    </article>
  )
}
