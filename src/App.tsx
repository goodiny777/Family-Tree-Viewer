import { useStore } from './store'
import { WelcomeScreen } from './components/Import/WelcomeScreen'
import { MainView } from './components/MainView'

function App() {
  const hasData = useStore((state) => state.gedcom.hasData)

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-canvas font-body text-text-primary">
      {hasData ? <MainView /> : <WelcomeScreen />}
    </div>
  )
}

export default App
