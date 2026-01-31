import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { AgentPanel } from './features/agent'
import { InspectorPanel } from './features/inspector'
import { Sidebar } from './features/sidebar'
import { useUIStore } from './store'
import './app.css'

function App(): React.JSX.Element {
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <Group orientation="horizontal" className="h-full w-full">
          {/* Left Sidebar */}
          {!sidebarCollapsed && (
            <>
              <Panel
                id="sidebar"
                minSize="220px"
                maxSize="400px"
                defaultSize="220px"
                className="h-full"
              >
                <Sidebar />
              </Panel>
              <Separator className="w-1 bg-transparent hover:bg-white/10 active:bg-white/15 transition-colors cursor-col-resize" />
            </>
          )}

          {/* Main Content */}
          <Panel id="main" className="h-full">
            <AgentPanel />
          </Panel>

          {/* Right Inspector */}
          <Separator className="w-1 bg-transparent hover:bg-white/10 active:bg-white/15 transition-colors cursor-col-resize" />
          <Panel
            id="inspector"
            minSize="220px"
            maxSize="400px"
            defaultSize="220px"
            className="h-full"
          >
            <InspectorPanel />
          </Panel>
        </Group>
      </div>
    </TooltipProvider>
  )
}

export default App
