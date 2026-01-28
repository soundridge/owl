// Workspace & Project types
export interface Project {
  id: string
  name: string
  workspaces: Workspace[]
}

export interface Workspace {
  id: string
  name: string
  branch: string
  status: 'ready' | 'conflicts' | 'archived' | 'active'
  changes: {
    added: number
    removed: number
  }
  isActive?: boolean
}

// Chat types
export interface Message {
  id: string
  type: 'user' | 'assistant' | 'error'
  content: string
  timestamp: Date
  metadata?: {
    toolCalls?: number
    messages?: number
    filesChanged?: number
  }
}

// File changes types
export interface FileChange {
  path: string
  added: number
  removed: number
}

// Terminal types
export interface TerminalLine {
  id: string
  type: 'prompt' | 'command' | 'output'
  content: string
  branch?: string
}
