import { Search } from 'lucide-react'
import { useState, useCallback } from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Search…', debounce = 300 }) {
  const [internal, setInternal] = useState(value || '')
  const [timer, setTimer] = useState(null)

  const handle = useCallback((e) => {
    const val = e.target.value
    setInternal(val)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => onChange(val), debounce))
  }, [timer, onChange, debounce])

  return (
    <div className="search-wrapper">
      <Search size={16} className="search-icon" />
      <input
        className="form-input search-input"
        value={internal}
        onChange={handle}
        placeholder={placeholder}
      />
    </div>
  )
}
