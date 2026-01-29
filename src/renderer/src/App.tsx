import { useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import './app.css'
import { ChatPanel } from './features/chat'
import { InspectorPanel } from './features/inspector'
import { Sidebar } from './features/sidebar'
import type { FileChange, Message, Project, TerminalLine } from './types'

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: 'conductor',
    name: 'conductor',
    workspaces: [
      {
        id: 'ws-1',
        name: 'archive-in-repo-details',
        branch: 'kampala-v3',
        status: 'ready',
        changes: { added: 312, removed: 332 },
      },
      {
        id: 'ws-2',
        name: 'system-tray-status',
        branch: 'caracas-v2',
        status: 'conflicts',
        changes: { added: 611, removed: 92 },
      },
      {
        id: 'ws-3',
        name: 'add-agent-workspaces-txt',
        branch: 'maputo-v2',
        status: 'ready',
        changes: { added: 88, removed: 6 },
      },
    ],
  },
  {
    id: 'swipe',
    name: 'swipe',
    workspaces: [],
  },
  {
    id: 'melty',
    name: 'melty_home',
    workspaces: [],
  },
]

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'error',
    content: "ReferenceError: Can't find variable useDefaultOpenInApp",
    timestamp: new Date(),
    metadata: { filesChanged: 1 },
  },
  {
    id: '2',
    type: 'assistant',
    content:
      "Perfect. I've added the missing imports. Now let me run the validation to make sure everything compiles correctly.",
    timestamp: new Date(),
    metadata: { toolCalls: 13, messages: 7, filesChanged: 1 },
  },
  {
    id: '3',
    type: 'user',
    content:
      'cool works now. i was thinking it could be nice to use a version of the **command.tsx** in the `RepositoryDetailsDialog.tsx` instead of trying to reinvent the wheel of searching/navigating with keyboard',
    timestamp: new Date(),
  },
  {
    id: '4',
    type: 'assistant',
    content:
      "The refactoring is complete. Here's what changed:\n\n1. **Replaced custom search with CommandInput** - built-in search styling and keyboard navigation.\n2. **Scroll to bottom**: CommandList handles overflow and virtualization more cleanly.\n3. **Added tool renderers** to keep the palette fast and consistent.",
    timestamp: new Date(),
    metadata: { toolCalls: 15, messages: 13 },
  },
]

const mockFiles: FileChange[] = [
  { path: 'src/App.tsx', added: 2, removed: 5 },
  { path: 'src/core/conductor/WorkspaceAPI.ts', added: 53, removed: 10 },
  { path: 'src/ui/components/FileBadge.tsx', added: 12, removed: 3 },
  { path: 'src/ui/components/RepositoryDetailsDialog.tsx', added: 229, removed: 117 },
  { path: 'src/ui/components/ToolRenderers.tsx', added: 17, removed: 2 },
  { path: 'src/ui/components/WorkspaceSidebar.tsx', added: 1, removed: 15 },
]

const mockTerminalLines: TerminalLine[] = [
  { id: '1', type: 'command', content: 'npm run lint' },
  { id: '2', type: 'output', content: 'Lint complete in 4.1s' },
  { id: '3', type: 'command', content: 'git status' },
  { id: '4', type: 'output', content: 'nothing to commit, working tree clean' },
]

function App(): React.JSX.Element {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws-1')
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  const activeWorkspace = mockProjects
    .flatMap((p) => p.workspaces)
    .find((w) => w.id === activeWorkspaceId)

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Group orientation="horizontal" id="main-layout">
        {/* Sidebar with vibrancy effect */}
        {!sidebarCollapsed && (
          <>
            <Panel
              id="sidebar"
              defaultSize="15%"
              minSize="12%"
              maxSize="25%"
              className="flex"
            >
              <Sidebar
                projects={mockProjects}
                activeWorkspaceId={activeWorkspaceId}
                onWorkspaceSelect={setActiveWorkspaceId}
                onToggleCollapse={() => setSidebarCollapsed(true)}
              />
            </Panel>
            <Separator className="w-px bg-[var(--separator)] transition-colors hover:bg-[var(--border-active)]" />
          </>
        )}

        {/* Main content area */}
        <Panel id="chat" minSize="30%">
          <ChatPanel
            workspace={activeWorkspace}
            messages={messages}
            prNumber="1432"
            onSendMessage={handleSendMessage}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </Panel>

        <Separator className="w-px bg-[var(--separator)] transition-colors hover:bg-[var(--border-active)]" />

        {/* Inspector panel */}
        <Panel
          id="inspector"
          defaultSize="22%"
          minSize="15%"
          maxSize="40%"
          className="flex"
        >
          <InspectorPanel
            files={mockFiles}
            terminalLines={mockTerminalLines}
            branch="kampala-v3"
          />
        </Panel>
      </Group>
    </div>
  )
}

export default App
