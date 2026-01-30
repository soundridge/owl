import { useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import './app.css'
import { InspectorPanel } from './features/inspector'
import { Sidebar } from './features/sidebar'
import { TerminalPanel } from './features/terminal'
import { useAppStore } from './store'

function App(): React.JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const {
    // State
    workspaces,
    activeWorkspaceId,
    activeSessionId,
    activeSession,
    changes,
    terminal,
    branchInfo,

    // Actions
    selectWorkspace,
    addWorkspace,
    selectSession,
    createSession,
    refreshChanges,
    resetToMockData,
  } = useAppStore()

  // Terminal actions (mock for now)
  const handleStartTerminal = () => {
    console.log('Start terminal for session:', activeSessionId)
  }

  const handleStopTerminal = () => {
    console.log('Stop terminal for session:', activeSessionId)
  }

  const handleRestartTerminal = () => {
    console.log('Restart terminal for session:', activeSessionId)
  }

  // Merge action (mock for now)
  const handleMerge = () => {
    console.log('Merge session:', activeSessionId)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Group orientation="horizontal" id="main-layout">
        {/* Left: Sidebar with Workspace + Session list */}
        {!sidebarCollapsed && (
          <>
            <Panel
              id="sidebar"
              defaultSize={15}
              minSize={12}
              maxSize={25}
              className="flex"
            >
              <Sidebar
                workspaces={workspaces}
                activeWorkspaceId={activeWorkspaceId}
                activeSessionId={activeSessionId}
                onWorkspaceSelect={selectWorkspace}
                onSessionSelect={selectSession}
                onAddWorkspace={addWorkspace}
                onNewSession={createSession}
                onToggleCollapse={() => setSidebarCollapsed(true)}
                onRetry={resetToMockData}
              />
            </Panel>
            <Separator className="w-px bg-[var(--separator)] transition-colors hover:bg-[var(--border-active)]" />
          </>
        )}

        {/* Middle: Terminal container */}
        <Panel id="terminal" minSize={30}>
          <TerminalPanel
            session={activeSession}
            terminal={terminal}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onStartTerminal={handleStartTerminal}
            onStopTerminal={handleStopTerminal}
            onRestartTerminal={handleRestartTerminal}
          />
        </Panel>

        <Separator className="w-px bg-[var(--separator)] transition-colors hover:bg-[var(--border-active)]" />

        {/* Right: Changes list + Branch info */}
        <Panel
          id="inspector"
          defaultSize={22}
          minSize={15}
          maxSize={40}
          className="flex"
        >
          <InspectorPanel
            changes={changes}
            branchInfo={branchInfo}
            onRefreshChanges={refreshChanges}
            onMerge={handleMerge}
          />
        </Panel>
      </Group>
    </div>
  )
}

export default App
