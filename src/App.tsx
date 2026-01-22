import { useStore } from './store'
import { WelcomeScreen } from './components/Import/WelcomeScreen'
import { MainView } from './components/MainView'
import { SettingsOverlay } from './components/Settings/SettingsOverlay'
import { PrivacyPolicyOverlay } from './components/Legal/PrivacyPolicyOverlay'
import { TermsOfServiceOverlay } from './components/Legal/TermsOfServiceOverlay'
import { useInitialization } from './hooks/useInitialization'

function App() {
  const hasData = useStore((state) => state.gedcom.hasData)
  const isSettingsOverlayOpen = useStore((state) => state.ui.isSettingsOverlayOpen)
  const isPrivacyPolicyOpen = useStore((state) => state.ui.isPrivacyPolicyOpen)
  const isTermsOfServiceOpen = useStore((state) => state.ui.isTermsOfServiceOpen)

  // Initialize theme and language settings
  useInitialization()

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-canvas font-body text-text-primary">
      {hasData ? <MainView /> : <WelcomeScreen />}
      {isSettingsOverlayOpen && <SettingsOverlay />}
      {isPrivacyPolicyOpen && <PrivacyPolicyOverlay />}
      {isTermsOfServiceOpen && <TermsOfServiceOverlay />}
    </div>
  )
}

export default App
