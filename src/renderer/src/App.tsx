import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { InspectorPanel } from './features/inspector'
import { Sidebar } from './features/sidebar'
import { TerminalPanel } from './features/terminal'
import { AppLayout, PanelLayout } from './layout'
import { useAppStore } from './store'
import './app.css'

function App(): React.JSX.Element {
  const {
    // State
    workspaces,
    activeWorkspaceId,
    activeSessionId,
    changes,
    terminal,
    branchInfo,
    sidebarCollapsed,

    // Computed
    getActiveSession,

    // Actions
    selectWorkspace,
    selectSession,
    refreshChanges,
    toggleSidebar,
    resetToMockData,
    setTerminal,
  } = useAppStore()

  const activeSession = getActiveSession()

  // Terminal actions (mock for now)
  const handleStartTerminal = () => {
    setTerminal({ isConnected: true, status: 'running' })
  }

  const handleStopTerminal = () => {
    setTerminal({ isConnected: false, status: 'idle' })
  }

  const handleRestartTerminal = () => {
    setTerminal({ isConnected: false, status: 'idle' })
    setTimeout(() => {
      setTerminal({ isConnected: true, status: 'running' })
    }, 500)
  }

  // Workspace actions (mock for now)
  const handleAddWorkspace = () => {
    // TODO: Open file dialog via IPC
  }

  const handleCreateSession = () => {
    // TODO: Call IPC to create session
  }

  // Merge action (mock for now)
  const handleMerge = () => {
    // TODO: Open merge dialog
  }

  return (
    <TooltipProvider delayDuration={300}>
      <AppLayout>
        <PanelLayout
          sidebarCollapsed={sidebarCollapsed}
          sidebar={(
            <Sidebar
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              activeSessionId={activeSessionId}
              onWorkspaceSelect={selectWorkspace}
              onSessionSelect={selectSession}
              onAddWorkspace={handleAddWorkspace}
              onCreateSession={handleCreateSession}
              onToggleCollapse={toggleSidebar}
              onRetry={resetToMockData}
            />
          )}
          main={(
            <TerminalPanel
              session={activeSession}
              terminal={terminal}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={toggleSidebar}
              onStartTerminal={handleStartTerminal}
              onStopTerminal={handleStopTerminal}
              onRestartTerminal={handleRestartTerminal}
            />
          )}
          inspector={(
            <InspectorPanel
              changes={changes}
              branchInfo={branchInfo}
              onRefreshChanges={refreshChanges}
              onMerge={handleMerge}
            />
          )}
        />
      </AppLayout>
    </TooltipProvider>
  )
}

export default App
