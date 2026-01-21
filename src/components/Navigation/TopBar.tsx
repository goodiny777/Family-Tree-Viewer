import { useStore } from '../../store'

export function TopBar() {
  const { setSearchOpen, setSidePanelTab, setExportDialogOpen } = useStore((state) => state.ui)
  const { clearGedcomData } = useStore((state) => state.gedcom)

  return (
    <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-primary/95 px-4 py-2 backdrop-blur-sm">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <img src="/gen_to_tree.png" alt="Logo" className="h-8 w-8" />
        <span className="font-display text-lg font-semibold text-white">
          FamilyTree View
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
          aria-label="Search"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-sm">Search</span>
        </button>

        {/* Import */}
        <button
          onClick={() => clearGedcomData()}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
          aria-label="Import"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="text-sm">Import</span>
        </button>

        {/* Export */}
        <button
          onClick={() => setExportDialogOpen(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
          aria-label="Export"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span className="text-sm">Export</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setSidePanelTab('settings')}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
          aria-label="Settings"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </header>
  )
}
