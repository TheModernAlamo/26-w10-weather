/**
 * 기온 단위 변환 유틸리티
 */

/**
 * 섭씨 온도를 선택된 단위('C' | 'F')에 맞추어 변환한 정수값 반환
 * @param {number} celsius - 섭씨 온도
 * @param {'C' | 'F'} unit - 목표 단위
 * @returns {number} 변환된 온도 (반올림된 정수)
 */
export function convertTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || Number.isNaN(Number(celsius))) {
    return 0
  }
  const num = Number(celsius)
  if (unit === 'F') {
    return Math.round((num * 9) / 5 + 32)
  }
  return Math.round(num)
}

/**
 * 단위 기호를 포함한 기온 문자열 반환 (예: "18°C", "64°F")
 */
export function formatTemp(celsius, unit = 'C') {
  const converted = convertTemp(celsius, unit)
  return `${converted}°${unit}`
}
