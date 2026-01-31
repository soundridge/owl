import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { InspectorPanel } from './features/inspector'
import { Sidebar } from './features/sidebar'
import { AgentPanel } from './features/terminal'
import { useUIStore } from './store'
import './app.css'

function App(): React.JSX.Element {
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        {!sidebarCollapsed && (
          <div className="h-full w-[220px] shrink-0">
            <Sidebar />
          </div>
        )}
        <div className="h-full min-w-0 flex-1">
          <AgentPanel />
        </div>
        <div className="h-full w-[220px] shrink-0">
          <InspectorPanel />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
