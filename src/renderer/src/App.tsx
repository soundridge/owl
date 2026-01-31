import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { useEffect } from 'react'
import { InspectorPanel } from './features/inspector'
import { Sidebar } from './features/sidebar'
import { TerminalPanel } from './features/terminal'
import { AppLayout, PanelLayout } from './layout'
import { ipcServices } from './lib/ipc-client'
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
    fetchWorkspaces,
    addWorkspaceFromPath,
    selectWorkspace,
    selectSession,
    refreshChanges,
    toggleSidebar,
    setTerminal,
  } = useAppStore()

  const activeSession = getActiveSession()

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

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

  // Workspace actions
  const handleAddWorkspace = async () => {
    if (!ipcServices) {
      console.error('IPC services not available')
      return
    }

    // Open native folder selection dialog
    const dialogResult = await ipcServices.system.showOpenFolderDialog()
    if (!dialogResult.ok || !dialogResult.data) {
      // User cancelled or error
      return
    }

    const folderPath = dialogResult.data

    // Add workspace via IPC
    const result = await addWorkspaceFromPath(folderPath)
    if (!result.ok) {
      // TODO: Show error toast/notification
      console.error('Failed to add workspace:', result.error)
    }
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
              onRetry={fetchWorkspaces}
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
