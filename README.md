# 실시간 날씨·미세먼지 대시보드 (`26-w10-weather`)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Open--Meteo](https://img.shields.io/badge/API-Open--Meteo-orange)](https://open-meteo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Open-Meteo 글로벌 기상 위성 API와 연동하여 실시간 날씨 및 대기질 정보를 직관적으로 시각화하는 반응형 웹 대시보드입니다. 구글의 차세대 AI IDE인 **Antigravity**를 활용하여 구현 계획(Implementation Plan) 수립부터 모듈화 아키텍처 설계, 자체 기능 검증(Walkthrough)까지 체계적으로 개발되었습니다.

---

## 📌 목차
1. [실행 및 배포 링크](#-실행-및-배포-링크)
2. [소개 및 핵심 기능](#-소개-및-핵심-기능)
3. [프로젝트 구조](#-프로젝트-구조)
4. [로컬 실행 방법](#-로컬-실행-방법)
5. [어떻게 만들었나요 (Antigravity IDE 경험)](#-어떻게-만들었나요-antigravity-ide-경험)
6. [데이터는 어떻게 가져오나요 (외부 API 아키텍처)](#-데이터는-어떻게-가져오나요-외부-api-아키텍처)
7. [보안에서 확인한 것 (사이버보안과 체크포인트)](#-보안에서-확인한-것-사이버보안과-체크포인트)
8. [커스터마이징한 부분](#-커스터마이징한-부분)

---

## 🌐 실행 및 배포 링크

- **GitHub Pages 배포 URL**: [https://TheModernAlamo.github.io/26-w10-weather/](https://TheModernAlamo.github.io/26-w10-weather/)
- **Netlify 배포 URL**: [https://silver-starship-weather.netlify.app](https://silver-starship-weather.netlify.app)
- **제출 마일스톤 태그**: `v1.0`

---

## 🌟 소개 및 핵심 기능

- **실시간 기상 정보**: 선택한 도시의 현재 기온, 체감온도, 습도, 풍속, 강수량 및 WMO 표준 날씨 코드 기반 한국어 상태 라벨과 동적 날씨 아이콘 제공
- **대기질(미세먼지) 모니터링**: 미세먼지(PM10) 및 초미세먼지(PM2.5) 수치 시각화, 대한민국 환경부 4단계 기준('좋음', '보통', '나쁨', '매우 나쁨') 컬러 뱃지 및 게이지 바 표시
- **24시간 시간별 기온 예보**: 오늘 하루 시간대별 기온 변화를 직관적으로 확인할 수 있는 경량 반응형 SVG 꺾은선 차트 (모바일 가로 스크롤 지원)
- **7일간 주간 예보**: 향후 일주일간의 요일별 최고/최저 기온 범위 막대 및 최대 강수 확률(%) 표시
- **전 세계 도시 검색**: 400ms 디바운스(Debounce)를 적용한 Geocoding 도시 검색 및 자동완성 드롭다운
- **공항 항공편 결항/지연 위험도 분석**: 김포, 인천, 제주, 김해 등 주요 공항 권역 감지 시 실시간 기상 위해 요소를 분석하여 정상 운항/지연 주의/결항 위험 알림 제공
- **온도 단위 원클릭 변환**: 섭씨(°C)와 화씨(°F)를 실시간으로 스위칭하는 전역 단위 동기화

---

## 📂 프로젝트 구조

```text
26-w10-weather/
├── src/
│   ├── api/
│   │   └── weather.js          # Open-Meteo API 통신 레이어 (완전 분리)
│   ├── components/
│   │   ├── CurrentWeather.jsx  # 현재 날씨 카드 컴포넌트
│   │   ├── AirQualityCard.jsx  # 미세먼지 및 대기질 카드 컴포넌트
│   │   ├── HourlyChart.jsx     # 제로 디펜던시 24시간 SVG 꺾은선 차트
│   │   ├── WeeklyForecast.jsx  # 7일간 최고/최저 기온 및 강수 확률 카드
│   │   ├── CitySearch.jsx      # 400ms 디바운스 도시 검색 & 드롭다운
│   │   ├── FlightAlertCard.jsx # 공항 권역 항공편 결항/지연 분석 카드
│   │   └── WeatherIcon.jsx     # Lucide 동적 날씨 아이콘 매퍼
│   ├── utils/
│   │   └── temperature.js      # 섭씨/화씨 변환 헬퍼 유틸리티
│   ├── App.jsx                 # 대시보드 상태 합성 및 테마 관리
│   ├── App.css                 # 반응형 및 주야간 동적 비주얼 테마 CSS
│   └── main.jsx
├── guide.md                    # 실습 매뉴얼
├── README.md                   # 프로젝트 리포트 (본 문서)
└── GEMINI.md                   # AI Git 커밋 및 개발 워크플로우 규칙
```

---

## 💻 로컬 실행 방법

```bash
# 1. 저장소 복제
git clone https://github.com/TheModernAlamo/26-w10-weather.git
cd 26-w10-weather

# 2. dev 브랜치 체크아웃
git checkout dev

# 3. 패키지 설치
npm install

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 접속
# http://localhost:5173
```

---

## 🤖 어떻게 만들었나요 (Antigravity IDE 경험)

- **Copilot과의 차이점**:
  - 이전 주차에 사용했던 GitHub Copilot이 주로 에디터 안에서 몇 줄의 코드를 자동완성해 주는 보조 도구였다면, Antigravity는 프로젝트 전체 파일 구조와 커밋 규칙(`GEMINI.md`, `AGENTS.md`)을 사전에 이해하고 스스로 작업을 주도하는 **자율형 에이전트(Autonomous Agent)**의 성격을 띠었습니다.
- **Implementation Plan (구현 계획)의 가치**:
  - AI가 무작정 코드를 타이핑하지 않고, 작업에 앞서 컴포넌트 계층 다이어그램과 데이터 흐름, 잠재적인 리스크를 정리한 계획 문서를 먼저 제시하고 사용자의 승인(Proceed)을 받는 과정이 매우 인상적이었습니다. 요구사항 오해로 인한 코드 번복을 원천 차단할 수 있었습니다.
- **Walkthrough (자체 기능 검증)의 체감**:
  - 구현이 끝난 뒤 터미널 빌드(`npm.cmd run build`) 무결성 테스트를 직접 수행하고, 각 요구사항별 충족 여부와 시퀀스 다이어그램이 담긴 검증 리포트를 작성해 주어 완성도를 즉시 확신할 수 있었습니다.

---

## 📡 데이터는 어떻게 가져오나요 (외부 API 아키텍처)

- **Open-Meteo API의 특징**:
  - 복잡한 회원가입이나 비밀 API 키(Secret Key) 발급 절차가 필요 없는 **완전 공개(Public) 무료 기상 API**입니다. 키 탈취의 위험이 없으므로 프론트엔드 클라이언트(React)에서 직접 HTTPS로 호출하기에 이상적입니다.
- **UI 컴포넌트(`App.jsx`)와 API 통신 로직(`src/api/weather.js`)의 분리 이유**:
  - **관심사의 분리(Separation of Concerns)**와 **단일 책임 원칙(SRP)**을 준수하기 위함입니다. UI는 데이터 렌더링과 사용자 인터랙션에만 집중하고, 데이터 페칭, URL 파라미터 조합, 에러 핸들링은 전용 모듈이 전담함으로써 향후 API 엔드포인트 변경이나 목(Mock) 데이터 전환 시에도 UI 코드의 수정 없이 유연하게 대처할 수 있습니다.
- **디바운스(Debounce)의 필요성**:
  - 사용자가 검색창에 "Seoul"을 입력할 때 각 철자(`S` -> `e` -> `o` -> `u` -> `l`)가 입력될 때마다 즉시 API를 호출하면 찰나의 순간에 5번 이상의 불필요한 네트워크 트래픽이 발생합니다. 이는 서버에 DoS 형태의 부하를 유발하고, 무료 API 서버로부터 `429 Too Many Requests`(요청 횟수 초과)로 IP가 일시 차단될 위험이 있습니다. 400ms 디바운스를 적용하여 타이핑이 멈춘 후 1회만 호출하도록 최적화했습니다.

---

## 🛡️ 보안에서 확인한 것 (사이버보안과 체크포인트)

> [!NOTE]
> **Public API vs Secret Key API의 취급 차이**  
> Open-Meteo와 같은 공개 API는 누구나 무료로 호출 가능하므로 브라우저 환경에 노출되어도 무방합니다. 반면, 유료 과금 API(OpenAI, Google Maps 등)나 사내 DB 접근용 Secret Key는 브라우저 번들(JS) 또는 네트워크 탭을 통해 100% 노출될 수 있으므로 **절대로 프론트엔드 코드에 포함해서는 안 됩니다.**

> [!IMPORTANT]
> **백엔드 프록시(BFF, Backend For Frontend)의 필수성**  
> 비밀 키가 필요한 보안 API의 경우, 프론트엔드는 자체 백엔드(BFF)만을 호출하고, 실제 비밀 키는 서버 환경변수(`.env`)에 안전하게 보관하여 서버 간(Server-to-Server) 통신으로 외부 API를 호출해야 키 탈취 및 금전적 과금 사고를 원천 차단할 수 있습니다.

> [!WARNING]
> **HTTPS와 혼합 콘텐츠(Mixed Content) 방어**  
> 암호화된 `https://` 배포 환경에서 보안이 취약한 평문 `http://` API 엔드포인트를 호출할 경우, 통신 패킷이 중간자 공격(MITM)에 의해 감청되거나 변조될 수 있습니다. 이를 방지하기 위해 최신 브라우저는 보안 정책에 따라 Mixed Content 요청을 강제로 차단합니다. 본 프로젝트는 모든 외부 엔드포인트를 안전한 HTTPS로만 통신하도록 구성했습니다.

---

## ✨ 커스터마이징한 부분

1. **주야간(is_day) & 기상 상태 연동 동적 비주얼 테마 시스템**:
   - `is_day`(낮/밤)와 `weather_code`를 조합하여 맑은 낮, 맑은 밤, 비, 눈, 뇌우, 안개, 흐림 등 기상에 어울리는 부드러운 그라데이션과 야간 다크모드 가독성 보정 스타일을 자동 적용
2. **공항 인접 지역 감지 및 항공편 결항/지연 위험도 분석 카드 (`FlightAlertCard`)**:
   - 김포, 인천, 제주, 김해 등 주요 공항 권역 또는 검색어에 '공항/Airport'가 포함된 지역을 자동 감지
   - 풍속(≥30, ≥45 km/h), 뇌우(95), 폭설(75), 짙은 안개/저시정(45, 48) 등 항공 안전 위해 요소를 다차원 분석하여 **정상 운항(Normal)**, **지연 주의(Caution)**, **결항/지연 위험(High Risk)** 3단계 상태 및 원인 상세 제공
3. **섭씨(°C) ⟷ 화씨(°F) 원클릭 단위 변환 토글**:
   - 상단 헤더에 슬라이딩 스위치를 배치하여, 클릭 한 번으로 현재 기온, 체감온도, 24시간 SVG 차트의 곡선 좌표/레이블, 7일간 예보의 최고/최저 기온까지 전역 실시간 동기화
4. **6개 모듈형 컴포넌트 분리 (`src/components/`)**:
   - `CurrentWeather.jsx`, `AirQualityCard.jsx`, `HourlyChart.jsx`, `WeeklyForecast.jsx`, `CitySearch.jsx`, `FlightAlertCard.jsx`, `WeatherIcon.jsx`로 단일 책임 원칙 준수 모듈화
5. **제로 디펜던시 순수 SVG 24시간 꺾은선 기온 차트**:
   - 무거운 외부 차트 라이브러리 없이 인라인 SVG와 그라데이션 면적을 활용한 초경량 차트 및 모바일 가로 스크롤 구현
6. **400ms 디바운스 적용 전 세계 Geocoding 자동완성 드롭다운**:
   - 외부 클릭 감지(`mousedown`) 및 ESC 키 닫기 이벤트 핸들러 탑재
