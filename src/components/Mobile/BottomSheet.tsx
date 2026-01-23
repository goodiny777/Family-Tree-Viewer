import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const { t } = useTranslation()
  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)

  // Handle swipe down to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    currentYRef.current = 0
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startYRef.current
    currentYRef.current = Math.max(0, deltaY) // Only allow downward swipe

    if (sheetRef.current && deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (currentYRef.current > 100) {
      // Threshold to close
      onClose()
    }

    // Reset transform
    if (sheetRef.current) {
      sheetRef.current.style.transform = ''
    }
  }, [onClose])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          absolute inset-x-0 bottom-0 z-50
          max-h-[90vh] rounded-t-2xl bg-bg-panel shadow-panel
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3 cursor-grab">
          <div className="h-1 w-12 rounded-full bg-accent/40" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-accent/20">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent/10 transition-colors"
              aria-label={t('search.close')}
            >
              <svg className="h-5 w-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  )
}
