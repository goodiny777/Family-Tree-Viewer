import { useState, useCallback, useEffect, useRef } from 'react'
import { useStore } from '../../store'
import { Input } from '../ui/Input'
import type { Individual } from '../../types'

export function SearchOverlay() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Individual[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setSearchOpen } = useStore((state) => state.ui)
  const gedcomData = useStore((state) => state.gedcom.data)
  const { setFocusedPerson } = useStore((state) => state.selection)
  const { centerOnNode } = useStore((state) => state.viewport)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search individuals
  useEffect(() => {
    if (!query.trim() || !gedcomData) {
      setResults([])
      return
    }

    const searchTerm = query.toLowerCase()
    const matches: Individual[] = []

    gedcomData.individuals.forEach((person) => {
      const fullName = person.name.full?.toLowerCase() || ''
      const given = person.name.given?.toLowerCase() || ''
      const surname = person.name.surname?.toLowerCase() || ''
      const id = person.id.toLowerCase()

      if (
        fullName.includes(searchTerm) ||
        given.includes(searchTerm) ||
        surname.includes(searchTerm) ||
        id.includes(searchTerm)
      ) {
        matches.push(person)
      }
    })

    // Sort by relevance (exact matches first, then by name)
    matches.sort((a, b) => {
      const aName = a.name.full?.toLowerCase() || ''
      const bName = b.name.full?.toLowerCase() || ''
      const aExact = aName === searchTerm
      const bExact = bName === searchTerm

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return aName.localeCompare(bName)
    })

    setResults(matches.slice(0, 20)) // Limit to 20 results
    setSelectedIndex(0)
  }, [query, gedcomData])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setSearchOpen(false)
          break
      }
    },
    [results, selectedIndex, setSearchOpen]
  )

  const handleSelect = useCallback(
    (person: Individual) => {
      setFocusedPerson(person.id)
      centerOnNode(person.id)
      setSearchOpen(false)
    },
    [setFocusedPerson, centerOnNode, setSearchOpen]
  )

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSearchOpen(false)
      }
    },
    [setSearchOpen]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-20 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl rounded-lg bg-white shadow-panel animate-zoom">
        {/* Search input */}
        <div className="p-4">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search by name or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto border-t border-bg-aged scrollbar-thin">
            {results.map((person, index) => (
              <li key={person.id}>
                <button
                  onClick={() => handleSelect(person)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    index === selectedIndex ? 'bg-bg-panel' : 'hover:bg-bg-panel/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-body font-medium text-text-primary">
                        {person.name.full || 'Unknown'}
                      </p>
                      <p className="font-body text-small text-text-muted">
                        {person.birth?.date || ''}{' '}
                        {person.isDeceased && person.death?.date
                          ? `- ${person.death.date}`
                          : person.isDeceased
                          ? '- ?'
                          : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-body text-small text-text-muted">ID: {person.id}</span>
                      <div className="flex items-center gap-1 text-text-muted">
                        <span className="text-sm">
                          {person.gender === 'M' ? '♂' : person.gender === 'F' ? '♀' : '?'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* No results */}
        {query.trim() && results.length === 0 && (
          <div className="border-t border-bg-aged p-8 text-center">
            <p className="font-body text-body text-text-muted">No results found</p>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="flex items-center justify-between border-t border-bg-aged px-4 py-2">
          <div className="flex gap-4">
            <span className="font-body text-small text-text-muted">
              <kbd className="rounded bg-bg-aged px-1.5 py-0.5">↑↓</kbd> Navigate
            </span>
            <span className="font-body text-small text-text-muted">
              <kbd className="rounded bg-bg-aged px-1.5 py-0.5">Enter</kbd> Select
            </span>
          </div>
          <span className="font-body text-small text-text-muted">
            <kbd className="rounded bg-bg-aged px-1.5 py-0.5">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )
}
