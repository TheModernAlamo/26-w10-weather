import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, MapPin } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 400ms 디바운스 (Debounce) 적용하여 무분별한 API 요청 및 429 차단 방지
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(query)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('도시 검색 오류:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400) // 400ms 디바운스

    return () => clearTimeout(timer)
  }, [query])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSelect = (cityItem) => {
    onSelectCity({
      name: `${cityItem.name}${cityItem.admin1 ? ` (${cityItem.admin1})` : ''}`,
      lat: cityItem.latitude,
      lon: cityItem.longitude,
    })
    setQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="전 세계 도시 검색 (예: Seoul, Tokyo, Paris, New York)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {isSearching && <Loader2 size={18} className="search-spinner spinning" />}
        {!isSearching && query && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={handleClear}
            title="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="search-dropdown-menu">
          {results.length === 0 ? (
            <li className="no-result-item">검색 결과가 없습니다.</li>
          ) : (
            results.map((item) => (
              <li
                key={`${item.id}-${item.latitude}-${item.longitude}`}
                className="search-dropdown-item"
                onClick={() => handleSelect(item)}
              >
                <MapPin size={16} className="dropdown-pin" />
                <div className="item-text">
                  <span className="item-city-name">{item.name}</span>
                  <span className="item-country-info">
                    {[item.admin1, item.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

